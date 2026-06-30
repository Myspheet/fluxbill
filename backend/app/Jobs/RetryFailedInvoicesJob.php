<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Domain\Billing\Models\Invoice;
use Illuminate\Support\Facades\Log;
use App\Jobs\ChargeBillingJob;

class RetryFailedInvoicesJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Invoice::withoutGlobalScopes()
        ->where('status', 'past_due')
        ->whereNotNull('next_attempt_at')
        ->where('next_attempt_at', '<=', now())
        ->chunkById(100, function ($invoices) {
            foreach ($invoices as $invoice) {
                ChargeBillingJob::dispatch($invoice);
            }
        });
    }
}
