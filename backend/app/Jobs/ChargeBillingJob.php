<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Bus\Queueable;



use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use App\Services\Nomba\NombaClient;
use App\Services\Billing\DunningRouter;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Models\DunningAttempt;
use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Subscriptions\Models\Subscription;
use App\Events\Billing\PaymentSucceeded;
use App\Events\Billing\PaymentFailed;
use App\Events\Subscriptions\SubscriptionRenewed;
use App\Events\Subscriptions\SubscriptionPastDue;


                                                                  
class ChargeBillingJob implements ShouldQueue
{
       use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
        public function __construct(public Invoice $invoice) {}

    public function handle(NombaClient $nomba, DunningRouter $router): void
    {
        Log::info("FluxBill: Attempting to charge invoice {$this->invoice->id}");
        $attemptRef = "{$this->invoice->merchant_tx_ref}_attempt_{$this->invoice->attempt_count}";
        $wasAlreadyFailed = $this->invoice->attempt_count > 0;

        $response = $nomba->post('/checkout/tokenized-card-payment', [
            'order' => [
                'orderReference' => $attemptRef,
                'customerId' => $this->invoice->customer->nomba_customer_id,
                'customerEmail' => $this->invoice->customer->email,
                'amount' => $this->invoice->amount,
                'currency' => 'NGN',
            ],
            'tokenKey' => $this->invoice->subscription->cardToken->nomba_card_id,
        ]);

        

        Log::info(json_encode($response, JSON_PRETTY_PRINT));

        $this->invoice->increment('attempt_count');
        $this->invoice->update(['last_attempt_tx_ref' => $attemptRef]);

        $statusCode = $response['data']['transactionDetails']['statusCode'] ?? null;

        if ($statusCode === 'PAYMENT SUCCESSFUL') {
            $this->handleSuccess($wasAlreadyFailed);
            return;
        }

        $this->handleFailure($response, $router);
    }

    protected function handleSuccess(bool $wasAlreadyFailed): void
    {
        DB::transaction(function () use ($wasAlreadyFailed) {
            $this->invoice->update([
                'status' => $wasAlreadyFailed ? 'recovered' : 'paid',
                'paid_at' => now(),
                'recovered_at' => $wasAlreadyFailed ? now() : null,
            ]);

            $this->invoice->subscription->update([
                'status' => 'active',
                'current_period_start' => now(),
                'current_period_end' => $this->nextBillingDate($this->invoice->subscription),
            ]);
        });

        PaymentSucceeded::dispatch($this->invoice, $wasAlreadyFailed);
        SubscriptionRenewed::dispatch($this->invoice->subscription->fresh());
    }

    protected function handleFailure(array $response, DunningRouter $router): void
    {
        // ⚠️ unconfirmed field — Nomba's docs don't show this on a failed
        // tokenized-card-payment response yet; verify against a real
        // declined sandbox transaction (5484497218317651) before relying on it
        $declineReason = $response['data']['decline_reason']
            ?? $response['description']
            ?? 'UNKNOWN';

        $decision = $router->nextAction($declineReason, $this->invoice->attempt_count);

        DB::transaction(function () use ($declineReason, $decision) {
            $wasAlreadyPastDue = in_array($this->invoice->subscription->status, ['past_due', 'grace_period'], true);

            $this->invoice->update([
                'status' => 'past_due',
                'decline_reason' => $declineReason,
                'next_attempt_at' => $decision['next_attempt_at'] ?? null,
            ]);

            DunningAttempt::create([
                'invoice_id' => $this->invoice->id,
                'subscription_id' => $this->invoice->subscription_id,
                'attempt_number' => $this->invoice->attempt_count,
                'merchant_tx_ref' => $this->invoice->last_attempt_tx_ref,
                'status' => 'failed',
                'failure_reason' => $declineReason,
                'attempted_at' => now(),
                'next_attempt_at' => $decision['next_attempt_at'] ?? null,
            ]);

            if (!$wasAlreadyPastDue) {
                $this->invoice->subscription->update([
                    'status' => 'past_due',
                    'past_due_since' => now(), // see note below — confirm/add this column
                ]);
            }

            // CARD_EXPIRED / FROZEN / STOLEN skip grace entirely per spec —
            // jump straight to suspended rather than waiting out day 7
            if ($decision['action'] ?? null === 'request_card_update') {
                $this->invoice->subscription->update(['status' => 'access_suspended']);
            }

            PaymentFailed::dispatch($this->invoice, $declineReason, $this->invoice->attempt_count);

            if (!$wasAlreadyPastDue) {
                SubscriptionPastDue::dispatch($this->invoice->subscription->fresh());
            }
        });

        if ($decision['retry'] ?? false) {
            self::dispatch($this->invoice)->delay($decision['next_attempt_at']);
        }
    }

    protected function nextBillingDate($subscription): Carbon
    {
        return match ($subscription->plan->interval) {
            'monthly' => now()->addMonth(),
            'yearly', 'annual' => now()->addYear(),
            'weekly' => now()->addWeek(),
            default => now()->addMonth(),
        };
    }

}
