<?php

namespace App\Http\Controllers\Api;

use App\Domain\Billing\ProrationService;
use App\Domain\Billing\Models\PlanChangeCredit;
use App\Domain\Billing\Models\PlanChangeHistory;
use App\Domain\Plans\Models\Plan;
use App\Domain\Subscriptions\Models\Subscription;
use App\Domain\Subscriptions\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SubscriptionController extends Controller
{
    protected ProrationService $prorationService;

    public function __construct(ProrationService $prorationService)
    {
        $this->prorationService = $prorationService;
    }

    /**
     * Change plan with proration calculation (upgrades and downgrades)
     */
    public function changePlan(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'new_plan_id' => ['required', 'uuid', 'exists:plans,id'],
        ]);

        $subscription = Subscription::findOrFail($id);
        $newPlan = Plan::findOrFail($validated['new_plan_id']);

        if ($subscription->plan_id === $newPlan->id) {
            return response()->json(['message' => 'Subscription is already on this plan.'], 422);
        }

        // Compute dates (with fallbacks if null)
        $start = $subscription->current_period_start ?: Carbon::now()->subMonth();
        $end = $subscription->current_period_end ?: Carbon::now();

        $periodLengthDays = max(1, (int) round($start->diffInDays($end)));
        $daysRemaining = max(0, (int) ceil(Carbon::now()->diffInDays($end, false)));

        $proration = $this->prorationService->calculate(
            (int) $subscription->plan->amount,
            (int) $newPlan->amount,
            $periodLengthDays,
            $daysRemaining
        );

        $oldPlanId = $subscription->plan_id;

        // Perform plan change
        if ($proration['change_type'] === 'upgrade') {
            // Immediately bill the net amount (simulated charge)
            PlanChangeHistory::create([
                'subscription_id' => $subscription->id,
                'old_plan_id' => $oldPlanId,
                'new_plan_id' => $newPlan->id,
                'change_type' => 'upgrade',
                'unused_credit' => $proration['unused_credit'],
                'new_plan_charge' => $proration['new_plan_charge'],
                'net_amount' => $proration['net_amount'],
                'days_remaining_at_change' => $proration['days_remaining'],
            ]);
        } else {
            // Downgrade: save credit to apply against next renewal
            $creditAmount = abs($proration['net_amount']);
            
            PlanChangeCredit::create([
                'subscription_id' => $subscription->id,
                'credit_amount' => $creditAmount,
                'applied' => false,
            ]);

            PlanChangeHistory::create([
                'subscription_id' => $subscription->id,
                'old_plan_id' => $oldPlanId,
                'new_plan_id' => $newPlan->id,
                'change_type' => 'downgrade',
                'unused_credit' => $proration['unused_credit'],
                'new_plan_charge' => $proration['new_plan_charge'],
                'net_amount' => $proration['net_amount'],
                'days_remaining_at_change' => $proration['days_remaining'],
            ]);
        }

        // Update plan on subscription
        $subscription->update([
            'plan_id' => $newPlan->id,
        ]);

        return response()->json([
            'message' => 'Plan changed successfully.',
            'proration' => $proration,
            'subscription' => [
                'id' => $subscription->id,
                'plan_id' => $subscription->plan_id,
                'status' => $subscription->status->value,
            ]
        ]);
    }

    /**
     * Cancel a subscription immediately or at period end
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'immediately' => ['nullable', 'boolean'],
        ]);

        $subscription = Subscription::findOrFail($id);
        $immediately = (bool) ($validated['immediately'] ?? false);

        if ($immediately) {
            $subscription->update([
                'status' => SubscriptionStatus::Cancelled,
                'cancelled_at' => Carbon::now(),
            ]);
        } else {
            $subscription->update([
                'cancel_at_period_end' => true,
            ]);
        }

        return response()->json([
            'message' => $immediately ? 'Subscription cancelled immediately.' : 'Subscription set to cancel at period end.',
            'subscription' => [
                'id' => $subscription->id,
                'status' => $subscription->status->value,
                'cancel_at_period_end' => (bool) $subscription->cancel_at_period_end,
                'cancelled_at' => $subscription->cancelled_at ? $subscription->cancelled_at->toIso8601String() : null,
            ]
        ]);
    }
}
