<?php

namespace App\Listeners\Listeners\Billing;

use App\Events\PaymentFailed;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Jobs\Subscriptions\ScoreChurnRiskJob;

class RecalculateChurnSignals
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(PaymentFailed $event): void
    {
        ScoreChurnRiskJob::dispatch($event->invoice->subscription_id);
    }
}
