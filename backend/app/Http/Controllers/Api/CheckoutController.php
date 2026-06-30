<?php

namespace App\Http\Controllers\Api;

use App\Domain\Billing\Models\Invoice;
use App\Domain\Customers\Models\CardToken;
use App\Domain\Customers\Models\Customer;
use App\Domain\Plans\Models\Plan;
use App\Domain\Merchants\Models\Merchant;
use App\Domain\Subscriptions\Models\Subscription;
use App\Domain\Subscriptions\Models\GroupSubscription;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    /**
     * Create checkout session
     *
     * Creates customer if not exists, issues a pending invoice and returns redirect ref.
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_id' => ['required', 'uuid'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'seats' => ['nullable', 'integer', 'min:1'],
        ]);

        $plan = Plan::withoutGlobalScopes()->findOrFail($validated['plan_id']);
        
        // Find or create customer under this merchant
        $customer = Customer::withoutGlobalScopes()
            ->where('merchant_id', $plan->merchant_id)
            ->where('email', $validated['email'])
            ->first();

        if (!$customer) {
            $customer = Customer::create([
                'merchant_id' => $plan->merchant_id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
            ]);
        }

        $existingSubscription = Subscription::withoutGlobalScopes()
    ->where('merchant_id', $plan->merchant_id)
    ->where('customer_id', $customer->id)
    ->whereIn('status', ['active', 'trialing'])
    ->where(function ($query) {
        $query->whereNull('current_period_end')
              ->orWhere('current_period_end', '>', now());
    })
    ->first();

if ($existingSubscription) {
    return response()->json([
        'message' => 'You already have an active subscription.',
    ], 400);
}

        $seats = (int) ($validated['seats'] ?? 1);
        $totalAmount = (int) $plan->amount * $seats;

        // Encode seats count inside transaction reference to pass state safely
        $ref = 'ref_' . Str::random(12) . '_seats_' . $seats;

        $invoice = Invoice::create([
            'merchant_id' => $plan->merchant_id,
            'customer_id' => $customer->id,
            'plan_id' => $plan->id,
            'amount' => $totalAmount,
            'status' => 'open',
            'merchant_tx_ref' => $ref,
            'attempt_count' => 0,
        ]);

        return response()->json([
            'checkout_url' => rtrim((string) config('app.frontend_url'), '/').'/payment/return?ref='.$ref,
            'merchant_tx_ref' => $ref
        ]);
    }

    /**
     * Get status of checkout & simulate payment confirmation
     *
     * Transition the invoice to paid and create the active subscription.
     */
    public function status(string $ref): JsonResponse
    {
        $invoice = Invoice::withoutGlobalScopes()
            ->where('merchant_tx_ref', $ref)
            ->firstOrFail();

        if ($invoice->status->value === 'open') {
            // 1. Create tokenized card representation (mock)
            $cardToken = CardToken::create([
                'customer_id' => $invoice->customer_id,
                'nomba_card_id' => 'card_' . Str::random(16),
                'last_four' => '4242',
                'card_brand' => 'visa',
                'status' => 'active',
            ]);

            // 2. Create subscription
            $plan = Plan::withoutGlobalScopes()->findOrFail($invoice->plan_id);
            $trialDays = (int) $plan->trial_days;
            $status = $trialDays > 0 ? 'trialing' : 'active';

            $subscription = Subscription::create([
                'merchant_id' => $invoice->merchant_id,
                'customer_id' => $invoice->customer_id,
                'plan_id' => $invoice->plan_id,
                'status' => $status,
                'card_token_id' => $cardToken->id,
                'current_period_start' => now(),
                'current_period_end' => $plan->interval === 'monthly' ? now()->addMonth() : now()->addYear(),
                'trial_ends_at' => $trialDays > 0 ? now()->addDays($trialDays) : null,
            ]);

            // 3. Create GroupSubscription if multiple seats
            $seats = 1;
            if (preg_match('/_seats_(\d+)/', $ref, $matches)) {
                $seats = (int) $matches[1];
            }

            if ($seats > 1) {
                GroupSubscription::create([
                    'merchant_id' => $invoice->merchant_id,
                    'plan_id' => $invoice->plan_id,
                    'leader_customer_id' => $invoice->customer_id,
                    'seat_count' => $seats,
                    'status' => $status,
                    'current_period_end' => $subscription->current_period_end,
                    'card_token_id' => $cardToken->id,
                ]);
            }

            // 4. Close invoice
            $invoice->update([
                'status' => 'paid',
                'subscription_id' => $subscription->id,
                'paid_at' => now(),
            ]);
        }

        // Load entities to provide rich metadata for the success screen
        $plan = Plan::withoutGlobalScopes()->findOrFail($invoice->plan_id);
        $customer = Customer::withoutGlobalScopes()->findOrFail($invoice->customer_id);
        $merchant = Merchant::findOrFail($invoice->merchant_id);

        $seats = 1;
        if (preg_match('/_seats_(\d+)/', $ref, $matches)) {
            $seats = (int) $matches[1];
        }

        return response()->json([
            'status' => 'active',
            'invoice' => [
                'id' => $invoice->id,
                'merchant_tx_ref' => $invoice->merchant_tx_ref,
                'status' => 'paid',
                'amount' => $invoice->amount,
            ],
            'metadata' => [
                'planName' => $plan->name,
                'amount' => $invoice->amount,
                'interval' => $plan->interval,
                'customerName' => $customer->name,
                'customerEmail' => $customer->email,
                'seats' => $seats,
                'merchantName' => $merchant->name,
            ]
        ]);
    }
}
