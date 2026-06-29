<?php

namespace App\Http\Controllers\Api;

use App\Domain\Merchants\Models\Merchant;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * List all merchants
     *
     * Returns every registered merchant with aggregate counts
     * (plans, customers, subscriptions). Admin-only.
     */
    public function merchants(): JsonResponse
    {
        $merchants = Merchant::withCount(['plans', 'customers', 'subscriptions'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Merchant $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'webhook_url' => $m->webhook_url,
                'fee_billing_model' => $m->fee_billing_model,
                'fee_rate' => (int) $m->fee_rate,
                'nomba_sub_account_id' => $m->nomba_sub_account_id,
                'plans_count' => $m->plans_count,
                'customers_count' => $m->customers_count,
                'subscriptions_count' => $m->subscriptions_count,
                'created_at' => $m->created_at,
            ]);

        return response()->json(['data' => $merchants]);
    }

    /**
     * Platform summary
     *
     * Quick aggregate numbers for the admin dashboard header.
     */
    public function summary(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total_merchants' => Merchant::count(),
                'total_plans' => \App\Domain\Plans\Models\Plan::withoutGlobalScopes()->count(),
                'total_customers' => \App\Domain\Customers\Models\Customer::withoutGlobalScopes()->count(),
                'total_subscriptions' => \App\Domain\Subscriptions\Models\Subscription::withoutGlobalScopes()->count(),
            ],
        ]);
    }

    /**
     * Show single merchant details
     *
     * Returns details of a merchant along with their plans, customers,
     * subscriptions, and invoices. Bypasses the MerchantScope.
     */
    public function merchant(string $id): JsonResponse
    {
        $merchant = Merchant::findOrFail($id);

        $plans = \App\Domain\Plans\Models\Plan::withoutGlobalScopes()
            ->where('merchant_id', $merchant->id)
            ->get();

        $customers = \App\Domain\Customers\Models\Customer::withoutGlobalScopes()
            ->where('merchant_id', $merchant->id)
            ->get();

        $subscriptions = \App\Domain\Subscriptions\Models\Subscription::withoutGlobalScopes()
            ->where('merchant_id', $merchant->id)
            ->with(['plan', 'customer'])
            ->get();

        $invoices = \App\Domain\Billing\Models\Invoice::withoutGlobalScopes()
            ->where('merchant_id', $merchant->id)
            ->with(['customer'])
            ->get();

        return response()->json([
            'data' => [
                'merchant' => [
                    'id' => $merchant->id,
                    'name' => $merchant->name,
                    'email' => $merchant->email,
                    'webhook_url' => $merchant->webhook_url,
                    'fee_billing_model' => $merchant->fee_billing_model,
                    'fee_rate' => (int) $merchant->fee_rate,
                    'nomba_sub_account_id' => $merchant->nomba_sub_account_id,
                    'nomba_sub_account_ref' => $merchant->nomba_sub_account_ref,
                    'created_at' => $merchant->created_at,
                ],
                'plans' => $plans,
                'customers' => $customers,
                'subscriptions' => $subscriptions,
                'invoices' => $invoices,
            ]
        ]);
    }
}
