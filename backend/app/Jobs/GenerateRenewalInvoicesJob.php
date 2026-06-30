<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Domain\Subscriptions\Models\Subscription;
use App\Domain\Billing\Models\Invoice;
use Illuminate\Support\Str;
use App\Jobs\ChargeBillingJob;
use Illuminate\Support\Facades\Log;

class GenerateRenewalInvoicesJob implements ShouldQueue
{
      use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
         Log::info('GenerateRenewalInvoicesJob started');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
    
     $dueSubscriptions = Subscription::withoutGlobalScopes()
            ->with('plan')
            ->where('status', 'active')
            ->where('current_period_end', '<=', now()->addHours(24))
            ->get();

        Log::info("FluxBill: Found {$dueSubscriptions->count()} subscriptions due for renewal.");

        foreach ($dueSubscriptions as $subscription) {

            $alreadyPending = Invoice::withoutGlobalScopes()
                ->where('subscription_id', $subscription->id)
                ->where('status', 'open')
                ->exists();

            if ($alreadyPending) {
                Log::info("FluxBill: Skipping subscription {$subscription->id} - open renewal invoice already exists.");
                continue;
            }

            $invoice = Invoice::create([
                'merchant_id'      => $subscription->merchant_id,
                'subscription_id'  => $subscription->id,
                'customer_id'      => $subscription->customer_id,
                'plan_id'          => $subscription->plan_id,
                'amount'           => $subscription->plan->amount,
                'status'           => 'open',
                'merchant_tx_ref'  => 'inv_' . Str::random(16),
                'attempt_count'    => 0,
            ]);

            Log::info("FluxBill: Created renewal invoice {$invoice->id} for subscription {$subscription->id}.");

            ChargeBillingJob::dispatch($invoice);
        }

        Log::info("FluxBill: Renewal invoice generation completed.");
        }
}
