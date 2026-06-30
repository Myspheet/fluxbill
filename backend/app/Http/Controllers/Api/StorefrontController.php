<?php

namespace App\Http\Controllers\Api;

use App\Domain\Merchants\Models\Merchant;
use App\Domain\Plans\Models\Plan;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class StorefrontController extends Controller
{
    /**
     * Public storefront for a merchant
     *
     * Returns the merchant's public name and their active plans.
     * No authentication required — this is the customer-facing storefront.
     */
    public function show(string $merchantId): JsonResponse
    {
        $merchant = Merchant::findOrFail($merchantId);

        $plans = Plan::withoutGlobalScopes()
            ->where('merchant_id', $merchant->id)
            ->where('status', 'active')
            ->orderBy('amount')
            ->get()
            ->map(fn (Plan $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'amount' => (int) $p->amount,
                'currency' => $p->currency,
                'interval' => $p->interval,
                'interval_count' => (int) $p->interval_count,
                'trial_days' => (int) $p->trial_days,
            ]);

        return response()->json([
            'data' => [
                'merchant' => [
                    'id' => $merchant->id,
                    'name' => $merchant->name,
                ],
                'plans' => $plans,
            ],
        ]);
    }
}
