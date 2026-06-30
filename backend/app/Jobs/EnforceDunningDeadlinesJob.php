<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class EnforceDunningDeadlinesJob implements ShouldQueue
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
          Subscription::withoutGlobalScopes()
            ->where('status', 'past_due')
            ->where('past_due_since', '<=', now()->subDays(7))
            ->chunkById(100, function ($subs) {
                foreach ($subs as $sub) {
                    $sub->update(['status' => 'access_suspended']);
                    \App\Domain\Subscriptions\Events\SubscriptionPastDue::dispatch($sub); // or a dedicated AccessSuspended event if you want a distinct listener path
                }
            });

        // Day 14 — dunning exhausted, terminal cancellation
        Subscription::withoutGlobalScopes()
            ->where('status', 'access_suspended')
            ->where('past_due_since', '<=', now()->subDays(14))
            ->chunkById(100, function ($subs) {
                foreach ($subs as $sub) {
                    $sub->update(['status' => 'cancelled', 'cancelled_at' => now()]);
                }
            });
    }
}
