<?php

namespace App\Domain\Billing;

use App\Domain\Plans\Models\Plan;
use App\Domain\Subscriptions\Models\Subscription;
use Carbon\Carbon;

/**
 * Proration on mid-cycle plan changes (docs/04 §5). Officially "Must Include".
 *
 * Worked example: ₦5,000/mo -> ₦10,000/mo on day 15 of 30 -> credit ₦2,500
 * (unused old) + charge ₦5,000 (new, remaining days) -> net ₦2,500 now.
 *
 * All amounts in kobo (integer). The arithmetic lives in calculate() so it can
 * be unit-tested with no DB; calculateChange() just feeds it model data.
 */
class ProrationService
{
    /**
     * Pure proration arithmetic.
     *
     * @return array{
     *     unused_credit: int,
     *     new_plan_charge: int,
     *     net_amount: int,
     *     days_remaining: int,
     *     change_type: string
     * }
     */
    public function calculate(int $oldPlanAmount, int $newPlanAmount, int $periodLengthDays, int $daysRemaining): array
    {
        $periodLengthDays = max(1, $periodLengthDays);
        $daysRemaining = max(0, min($daysRemaining, $periodLengthDays));

        $unusedCredit = (int) round(($oldPlanAmount / $periodLengthDays) * $daysRemaining);
        $newPlanCharge = (int) round(($newPlanAmount / $periodLengthDays) * $daysRemaining);

        return [
            'unused_credit' => $unusedCredit,
            'new_plan_charge' => $newPlanCharge,
            'net_amount' => $newPlanCharge - $unusedCredit, // negative = credit owed
            'days_remaining' => $daysRemaining,
            'change_type' => $newPlanAmount >= $oldPlanAmount ? 'upgrade' : 'downgrade',
        ];
    }

    /** Resolve period/day inputs from a live subscription, then delegate to calculate(). */
    public function calculateChange(Subscription $subscription, Plan $newPlan): array
    {
        $start = $subscription->current_period_start;
        $end = $subscription->current_period_end;

        $periodLengthDays = (int) round($start->diffInDays($end));
        $daysRemaining = (int) ceil(Carbon::now()->diffInDays($end, false));

        return $this->calculate(
            (int) $subscription->plan->amount,
            (int) $newPlan->amount,
            $periodLengthDays,
            $daysRemaining,
        );
    }
}
