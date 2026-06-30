<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\GenerateRenewalInvoicesJob;
use App\Jobs\RetryFailedInvoicesJob;


class FluxBillSweepCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'fluxbill:sweep';

    /**
     * The console command description.
     */
    protected $description = 'Run the FluxBill recurring billing engine';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting FluxBill billing sweep...');

        // Generate invoices for subscriptions due for renewal
        GenerateRenewalInvoicesJob::dispatch();

        // Retry invoices that previously failed
        RetryFailedInvoicesJob::dispatch();

        $this->info('Billing jobs dispatched successfully.');

        return self::SUCCESS;
    }

}
