<?php

namespace App\Domain\Billing;

use Carbon\Carbon;

/**
 * The Smart Retry Engine's decision core (docs/04 §2) — THE differentiator.
 *
 * Routes a failed charge by WHY it failed, not on a blind day-1/3/5/7 schedule:
 * an expired card is never retried; a bank outage is retried aggressively and
 * quietly. Pure logic — no Nomba, fully unit-tested pre-window.
 *
 * ⚠️ TO-CONFIRM (Day 1): the exact decline-reason field name + value set on a
 * failed /tokenized-card/charge are NOT confirmed by Nomba's docs. The values
 * below are standard card-processor categories; verify against the real API on
 * Day 1 and adjust the match() cases. This is the #1 integration risk.
 */
class DunningRouter
{
    /** Standard-processor decline reasons. Confirm against Nomba's live response Day 1. */
    public const REASON_INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS';
    public const REASON_CARD_EXPIRED = 'CARD_EXPIRED';
    public const REASON_FROZEN_CARD = 'FROZEN_CARD';
    public const REASON_STOLEN_CARD = 'STOLEN_CARD';
    public const REASON_DO_NOT_HONOR = 'DO_NOT_HONOR';
    public const REASON_BANK_UNAVAILABLE = 'BANK_UNAVAILABLE';

    /**
     * Decide what to do after a failed charge attempt.
     *
     * @return array{
     *     retry: bool,
     *     action?: string,
     *     next_attempt_at?: Carbon,
     *     customer_facing_alert?: bool
     * }
     */
    public function nextAction(string $declineReason, int $attemptNumber): array
    {
        return match ($declineReason) {
            // Retrying a dead/blocked card wastes a guaranteed-fail attempt —
            // the customer must act. Skips grace, goes straight to suspension.
            self::REASON_CARD_EXPIRED,
            self::REASON_FROZEN_CARD,
            self::REASON_STOLEN_CARD => [
                'retry' => false,
                'action' => 'request_card_update',
            ],

            // The bank flagged it; a second identical attempt rarely helps and
            // risks further flagging. One more try, +3 days.
            self::REASON_DO_NOT_HONOR => [
                'retry' => $attemptNumber < 2,
                'next_attempt_at' => Carbon::now()->addDays(3),
            ],

            // Infra failure, not the customer's fault — retry fast and quietly.
            self::REASON_BANK_UNAVAILABLE => [
                'retry' => true,
                'next_attempt_at' => Carbon::now()->addHours(4),
                'customer_facing_alert' => false,
            ],

            // Salary often clears within days — standard schedule.
            self::REASON_INSUFFICIENT_FUNDS => [
                'retry' => $attemptNumber < 4,
                'next_attempt_at' => $this->standardScheduleFor($attemptNumber),
            ],

            // Unknown reason — safe fallback to the standard schedule.
            default => [
                'retry' => $attemptNumber < 4,
                'next_attempt_at' => $this->standardScheduleFor($attemptNumber),
            ],
        };
    }

    /** Standard escalating schedule: day 3 -> day 5 -> day 7 -> day 7. */
    public function standardScheduleFor(int $attempt): Carbon
    {
        return match ($attempt) {
            1 => Carbon::now()->addDays(3),
            2 => Carbon::now()->addDays(5),
            3 => Carbon::now()->addDays(7),
            default => Carbon::now()->addDays(7),
        };
    }
}
