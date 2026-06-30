<?php

namespace App\Http\Controllers\Api;

use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Billing\PartialPaymentService;
use App\Domain\Customers\Models\CardToken;
use App\Domain\Subscriptions\Models\Subscription;
use App\Domain\Plans\Models\Plan;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    protected PartialPaymentService $partialPaymentService;

    public function __construct(PartialPaymentService $partialPaymentService)
    {
        $this->partialPaymentService = $partialPaymentService;
    }

    /**
     * Handle inbound Nomba Webhook (Card Payment, Bank Transfer, Failed Charge)
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->input();
        $requestId = $request->header('X-Nomba-Request-Id') ?: ($payload['request_id'] ?? Str::uuid()->toString());

        // Idempotency check
        $exists = DB::table('webhook_events')->where('request_id', $requestId)->exists();
        if ($exists) {
            return response()->json(['message' => 'Duplicate event ignored.'], 200);
        }

        // Record webhook event
        DB::table('webhook_events')->insert([
            'id' => Str::uuid()->toString(),
            'request_id' => $requestId,
            'payload' => json_encode($payload),
            'created_at' => now(),
        ]);

        $event = $payload['event'] ?? '';
        $ref = $payload['merchant_tx_ref'] ?? '';

        if (!$ref) {
            return response()->json(['message' => 'No transaction ref provided.'], 400);
        }

        // Find invoice
        $invoice = Invoice::withoutGlobalScopes()->where('merchant_tx_ref', $ref)->first();
        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found.'], 404);
        }

        switch ($event) {
            case 'payment.success':
                if ($invoice->status->value === 'open') {
                    // Create card token if not exists
                    $cardToken = CardToken::create([
                        'customer_id' => $invoice->customer_id,
                        'nomba_card_id' => 'card_' . Str::random(16),
                        'last_four' => '4242',
                        'card_brand' => 'visa',
                        'status' => 'active',
                    ]);

                    $plan = Plan::withoutGlobalScopes()->findOrFail($invoice->plan_id);
                    $trialDays = (int) $plan->trial_days;
                    $status = $trialDays > 0 ? 'trialing' : 'active';

                    $subscription = Subscription::create([
                        'merchant_id' => $invoice->merchant_id,
                        'customer_id' => $invoice->customer_id,
                        'plan_id' => $invoice->plan_id,
                        'status' => $status,
                        'card_token_id' => $cardToken->id,
                        'current_period_start' => now(),
                        'current_period_end' => $plan->interval === 'monthly' ? now()->addMonth() : now()->addYear(),
                        'trial_ends_at' => $trialDays > 0 ? now()->addDays($trialDays) : null,
                    ]);

                    // Update invoice
                    $invoice->update([
                        'status' => InvoiceStatus::Paid,
                        'subscription_id' => $subscription->id,
                        'paid_at' => now(),
                    ]);
                }
                break;

            case 'bank.transfer':
                // Virtual Account / Bank Transfer Webhook
                $amountReceived = (int) ($payload['amount'] ?? 0);
                $tolerance = 1000; // ₦10 tolerance in kobo

                $reconciliation = $this->partialPaymentService->reconcile(
                    (int) $invoice->amount,
                    $amountReceived,
                    $tolerance
                );

                if ($reconciliation['status'] === 'paid') {
                    $invoice->update([
                        'status' => InvoiceStatus::Paid,
                        'amount_received' => $amountReceived,
                        'amount_remaining' => 0,
                        'paid_at' => now(),
                    ]);

                    // Overpayment check
                    if ($reconciliation['overpayment_amount'] > 0) {
                        DB::table('overpayment_credits')->insert([
                            'id' => Str::uuid()->toString(),
                            'invoice_id' => $invoice->id,
                            'amount' => $reconciliation['overpayment_amount'],
                            'status' => 'pending_refund',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                } else {
                    $invoice->update([
                        'status' => InvoiceStatus::PartiallyPaid,
                        'amount_received' => $amountReceived,
                        'amount_remaining' => $reconciliation['amount_remaining'],
                    ]);
                }
                break;
        }

        return response()->json(['status' => 'success']);
    }
}
