<?php

namespace App\Http\Controllers\Api;

use App\Domain\Portal\PortalService;
use App\Domain\Subscriptions\Models\Subscription;
use App\Domain\Subscriptions\Enums\SubscriptionStatus;
use App\Domain\Plans\Models\Plan;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Enums\InvoiceStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PortalController extends Controller
{
    protected PortalService $portalService;

    public function __construct(PortalService $portalService)
    {
        $this->portalService = $portalService;
    }

    /**
     * Merchant endpoint: Generate a single-use portal magic link
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subscription_id' => ['required', 'uuid', 'exists:subscriptions,id'],
        ]);

        // Find subscription (merchant-scoped)
        $subscription = Subscription::findOrFail($validated['subscription_id']);

        $res = $this->portalService->generate($subscription);

        return response()->json([
            'portal_url' => $res['portal_url'],
            'expires_at' => $res['expires_at']->toIso8601String(),
        ]);
    }

    /**
     * Public customer endpoint: Resolve and consume magic link token
     */
    public function show(string $token): JsonResponse
    {
        $subscription = $this->portalService->consume($token);
       

        if (!$subscription) {
            return response()->json(['message' => 'Invalid, expired, or already used magic link.'], 404);
        }

        // Establish a secure session in cache
        $sessionToken = 'portal_sess_' . Str::random(40);
        Cache::put('portal_session_' . $sessionToken, $subscription->id, now()->addMinutes(60));

        // Load details
        $customer = $subscription->customer;
        $plan = $subscription->plan;
        $invoices = Invoice::withoutGlobalScopes()->where('subscription_id', $subscription->id)->latest()->get();

        // Get merchant other active plans for potential upgrade/downgrade
        $otherPlans = Plan::withoutGlobalScopes()
            ->where('merchant_id', $subscription->merchant_id)
            ->where('status', 'active')
            ->get()
            ->map(fn (Plan $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'amount' => $p->amount,
                'interval' => $p->interval,
            ]);

        return response()->json([
            'session_token' => $sessionToken,
            'subscription' => [
                'id' => $subscription->id,
                'status' => $subscription->status->value,
                'next_billing_date' => $subscription->current_period_end ? $subscription->current_period_end?->toISOString() : null,
                'cancel_at_period_end' => $subscription->cancel_at_period_end,
                'card_last_four' => $subscription->cardToken?->last_four ?: '4242',
                'customer' => $customer->name,
                'email' => $customer->email,
                'plan' => $plan->name,
                'amount' => $plan->amount,
            ],
            'invoices' => $invoices->map(fn (Invoice $inv) => [
                'id' => $inv->id,
                'date' => $inv->created_at->toDateString(),
                'amount' => $inv->amount,
                'status' => $inv->status->value,
            ]),
            'plans' => $otherPlans,
        ]);
    }

    /**
     * Customer portal: Cancel subscription
     */
    public function cancel(Request $request): JsonResponse
    {
        $sessionToken = $request->header('X-Portal-Session');
        $subId = Cache::get('portal_session_' . $sessionToken);

        if (!$subId) {
            return response()->json(['message' => 'Unauthorized or expired session.'], 401);
        }

        $subscription = Subscription::withoutGlobalScopes()->findOrFail($subId);
        
        $subscription->update([
            'cancel_at_period_end' => true,
        ]);

        return response()->json([
            'message' => 'Subscription will cancel at the end of the billing period.',
            'status' => SubscriptionStatus::Active->value,
            'cancel_at_period_end' => true,
        ]);
    }

    /**
     * Customer portal: Update card
     */
    public function updateCard(Request $request): JsonResponse
    {
        $sessionToken = $request->header('X-Portal-Session');
        $subId = Cache::get('portal_session_' . $sessionToken);

        if (!$subId) {
            return response()->json(['message' => 'Unauthorized or expired session.'], 401);
        }

        $subscription = Subscription::withoutGlobalScopes()->findOrFail($subId);
        
        // Return a mock checkout page to update card
        // In reality, this would initiate a ₦10 card verification checkout on Nomba
        $ref = 'card_update_' . Str::random(12);

        return response()->json([
            'checkout_url' => rtrim((string) config('app.frontend_url'), '/').'/payment/return?ref='.$ref,
        ]);
    }

    /**
     * Customer portal: Change plan
     */
    public function changePlan(Request $request): JsonResponse
    {
        $sessionToken = $request->header('X-Portal-Session');
        $subId = Cache::get('portal_session_' . $sessionToken);

        if (!$subId) {
            return response()->json(['message' => 'Unauthorized or expired session.'], 401);
        }

        $validated = $request->validate([
            'new_plan_id' => ['required', 'uuid', 'exists:plans,id'],
        ]);

        $subscription = Subscription::withoutGlobalScopes()->findOrFail($subId);
        $newPlan = Plan::withoutGlobalScopes()->findOrFail($validated['new_plan_id']);

        if ($subscription->plan_id === $newPlan->id) {
            return response()->json(['message' => 'Already on this plan.'], 422);
        }

        $start = $subscription->current_period_start ?: Carbon::now()->subMonth();
        $end = $subscription->current_period_end ?: Carbon::now();

        $periodLengthDays = max(1, (int) round($start->diffInDays($end)));
        $daysRemaining = max(0, (int) ceil(Carbon::now()->diffInDays($end, false)));

        $prorationService = app(\App\Domain\Billing\ProrationService::class);
        $proration = $prorationService->calculate(
            (int) $subscription->plan->amount,
            (int) $newPlan->amount,
            $periodLengthDays,
            $daysRemaining
        );

        $oldPlanId = $subscription->plan_id;

        if ($proration['change_type'] === 'upgrade') {
            \App\Domain\Billing\Models\PlanChangeHistory::create([
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
            $creditAmount = abs($proration['net_amount']);
            \App\Domain\Billing\Models\PlanChangeCredit::create([
                'subscription_id' => $subscription->id,
                'credit_amount' => $creditAmount,
                'applied' => false,
            ]);

            \App\Domain\Billing\Models\PlanChangeHistory::create([
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

        $subscription->update(['plan_id' => $newPlan->id]);

        return response()->json([
            'message' => 'Plan changed successfully.',
            'subscription' => [
                'id' => $subscription->id,
                'plan' => $newPlan->name,
                'amount' => $newPlan->amount,
            ]
        ]);
    }
}
