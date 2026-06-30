<?php

namespace App\Http\Controllers\Api;

use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Subscriptions\Enums\SubscriptionStatus;
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
use Illuminate\Support\Facades\DB;
use App\Services\Nomba\NombaClient;

use Illuminate\Support\Facades\Log;


class CheckoutController extends Controller
{

       public function __construct(protected NombaClient $nomba)
    {
    }



    /**
     * Create checkout session
     *
     * Creates customer if not exists, issues a pending invoice and returns redirect ref.
     */
//     public function checkout(Request $request): JsonResponse
//     {
//         $validated = $request->validate([
//             'plan_id' => ['required', 'uuid'],
//             'name' => ['required', 'string', 'max:255'],
//             'email' => ['required', 'email', 'max:255'],
//             'phone' => ['nullable', 'string', 'max:50'],
//             'seats' => ['nullable', 'integer', 'min:1'],
//         ]);

//         $plan = Plan::withoutGlobalScopes()->findOrFail($validated['plan_id']);
        
//         // Find or create customer under this merchant
//         $customer = Customer::withoutGlobalScopes()
//             ->where('merchant_id', $plan->merchant_id)
//             ->where('email', $validated['email'])
//             ->first();

//         if (!$customer) {
//             $customer = Customer::create([
//                 'merchant_id' => $plan->merchant_id,
//                 'name' => $validated['name'],
//                 'email' => $validated['email'],
//                 'phone' => $validated['phone'] ?? null,
//             ]);
//         }

//         $existingSubscription = Subscription::withoutGlobalScopes()
//     ->where('merchant_id', $plan->merchant_id)
//     ->where('customer_id', $customer->id)
//     ->whereIn('status', ['active', 'trialing'])
//     ->where(function ($query) {
//         $query->whereNull('current_period_end')
//               ->orWhere('current_period_end', '>', now());
//     })
//     ->first();

// if ($existingSubscription) {
//     return response()->json([
//         'message' => 'You already have an active subscription.',
//     ], 400);
// }

//         $seats = (int) ($validated['seats'] ?? 1);
//         $totalAmount = (int) $plan->amount * $seats;

    
//            $ref = 'inv_' . Str::random(16);

//         $invoice = Invoice::create([
//             'merchant_id' => $plan->merchant_id,
//             'customer_id' => $customer->id,
//             'plan_id' => $plan->id,
//             'amount' => $totalAmount,
//             'status' => 'open',
//             'merchant_tx_ref' => $ref,
//             'attempt_count' => 0,
//         ]);

//          $response = $this->nomba->post('/checkout/order', [
//             'order' => [
//                 'orderReference' => $invoice->merchant_tx_ref,
//                 'amount' => $invoice->amount,
//                 'currency' => 'NGN',
//                 'callbackUrl' => rtrim((string) config('app.frontend_url'), '/') . '/payment/return?ref=' . $ref,
//                 'customerEmail' => $customer->email,
//                 'tokenizeCard' => true,
//             ],
//         ]);

//         Log::info('Checkout order response', $response);

//   $checkoutUrl = $response['data']['checkoutLink'] ?? null;

//         if (!$checkoutUrl) {
//             Log::error('Nomba checkout/order did not return a checkoutUrl', [
//                 'merchant_tx_ref' => $ref,
//                 'response' => $response,
//             ]);

//             $invoice->update(['status' => 'void']);

//             return response()->json([
//                 'error' => [
//                     'code' => 'checkout_creation_failed',
//                     'message' => 'Could not start checkout with Nomba.',
//                     'field' => null,
//                     'request_id' => (string) Str::uuid(),
//                 ],
//             ], 502);
//         }


//         return response()->json([
//             'checkout_url' =>  $checkoutUrl, 
//             'merchant_tx_ref' => $ref
//         ]);
//     }


    public function checkout(Request $request): JsonResponse
{
    $validated = $request->validate([
        'plan_id' => ['required', 'uuid'],
        'name'    => ['required', 'string', 'max:255'],
        'email'   => ['required', 'email', 'max:255'],
        'phone'   => ['nullable', 'string', 'max:50'],
        'seats'   => ['nullable', 'integer', 'min:1'],
    ]);

    $plan = Plan::withoutGlobalScopes()->findOrFail($validated['plan_id']);

    // Find or create customer
    $customer = Customer::withoutGlobalScopes()
        ->where('merchant_id', $plan->merchant_id)
        ->where('email', $validated['email'])
        ->first();

    if (!$customer) {
        $customer = Customer::create([
            'merchant_id' => $plan->merchant_id,
            'name'        => $validated['name'],
            'email'       => $validated['email'],
            'phone'       => $validated['phone'] ?? null,
        ]);
    }

    // Prevent duplicate active subscriptions
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

    $seats = max(1, (int) ($validated['seats'] ?? 1));
    $totalAmount = $plan->amount * $seats;

    // Our internal reference
    $merchantReference = (string) Str::uuid();

    $invoice = Invoice::create([
        'merchant_id'      => $plan->merchant_id,
        'customer_id'      => $customer->id,
        'plan_id'          => $plan->id,
        'amount'           => $totalAmount,
        'status'           => 'open',
        'merchant_tx_ref'  => $merchantReference,
        'attempt_count'    => 0,
    ]);

    $payload = [
        'order' => [
            'orderReference' => $merchantReference,
            'amount'         => number_format($invoice->amount, 2, '.', ''),
            'currency'       => 'NGN',
            'callbackUrl'    => rtrim(config('app.frontend_url'), '/')
                . '/payment/return?ref=' . $merchantReference,
            'customerEmail'  => $customer->email,
            'customerId'     => (string) $customer->id,
        ],
        'tokenizeCard' => true,
    ];

    Log::info('Creating Nomba checkout order', [
        'invoice_id' => $invoice->id,
        'payload'    => $payload,
    ]);

    $response = $this->nomba->post('/checkout/order', $payload);

    Log::info('Checkout order response', $response);

    $checkoutUrl = data_get($response, 'data.checkoutLink');
    $gatewayReference = data_get($response, 'data.orderReference');

    if (!$checkoutUrl) {

        $invoice->update([
            'status' => 'void',
        ]);

        Log::error('Failed to create Nomba checkout order', [
            'invoice_id' => $invoice->id,
            'response'   => $response,
        ]);

        return response()->json([
            'error' => [
                'code' => 'checkout_creation_failed',
                'message' => 'Unable to create checkout session.',
                'request_id' => (string) Str::uuid(),
            ]
        ], 502);
    }

    // Save what Nomba actually returned
    $invoice->update([
        'gateway_order_reference' => $gatewayReference,
    ]);

    return response()->json([
        'checkout_url' => $checkoutUrl,
        'merchant_tx_ref' => $merchantReference,
        'order_reference' => $gatewayReference,
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

    // Already finalized — return immediately, don't call Nomba again
    if ($invoice->status !== InvoiceStatus::Open) {
        return $this->buildResponse($invoice);
    }

$response = $this->nomba->get(
    '/checkout/order/' . $invoice->merchant_tx_ref
);

Log::info('Checkout verification', [
    'response' => $response,
]);


    $statusCode = $response['data']['transactionDetails']['statusCode'] ?? 'PAYMENT SUCCESSFUL';

    // still processing, keep polling
    if ($statusCode === null) {
        return $this->buildResponse($invoice);
    }

    // Explicit failure from Nomba
    if ($statusCode !== 'PAYMENT SUCCESSFUL') {
        $invoice->update(['status' => InvoiceStatus::Failed]);
        return $this->buildResponse($invoice->fresh());
    }

    // Payment confirmed — write everything atomically
    $subscription = null;

    DB::transaction(function () use ($invoice, $response, &$subscription) {

        // Re-read inside transaction — guards against two simultaneous polls
        // both seeing 'open' and both creating a subscription
        if ($invoice->fresh()->status !== InvoiceStatus::Open) {
            return;
        }

        $cardDetails      = $response['data']['cardDetails'] ?? [];
        $paymentReference = $response['data']['transactionDetails']['paymentReference'] ?? $invoice->merchant_tx_re;  //chnage this later
        $paymentReference = $invoice->merchant_tx_re;  //chnage this later


        if (!$paymentReference) {
            Log::error('Nomba payment success missing paymentReference', [
                'merchant_tx_ref' => $invoice->merchant_tx_ref,
                'response'        => $response,
            ]);
           
            // throw new \RuntimeException('Missing paymentReference in Nomba response');
        }

          $paymentReference = 'TEST_' . Str::uuid();
        // Save card token — this is the tokenKey used by ChargeBillingJob
        // for every future renewal. If this value is wrong, all renewals fail.
        $cardToken = CardToken::firstOrCreate(
            ['nomba_card_id' => $paymentReference],
            [
                'customer_id' => $invoice->customer_id,
                'last_four'   => isset($cardDetails['cardPan'])
                    ? substr($cardDetails['cardPan'], -4)
                    : 1234, //chnage this later
                'card_brand'  => $cardDetails['cardType'] ?? "test", //chnage this later
                'status'      => 'active',
            ]
        );

        $plan      = Plan::withoutGlobalScopes()->findOrFail($invoice->plan_id);
        $trialDays = (int) $plan->trial_days;

        if ($trialDays > 0) {
            // Trial: current period = the trial window itself
            // GenerateRenewalInvoicesJob picks this up when trial ends
            // (current_period_end approaches), then charges for first real period
            $status      = SubscriptionStatus::Trialing;
            $periodStart = now();
            $periodEnd   = now()->addDays($trialDays); // ← when first charge fires
            $trialEndsAt = now()->addDays($trialDays);
        } else {
            $status      = SubscriptionStatus::Active;
            $periodStart = now();
            $periodEnd   = match ($plan->interval) {
                'monthly'          => now()->addMonth(),
                'yearly', 'annual' => now()->addYear(),
                'weekly'           => now()->addWeek(),
                default            => now()->addMonth(),
            };
            $trialEndsAt = null;
        }

        $subscription = Subscription::create([
            'merchant_id'          => $invoice->merchant_id,
            'customer_id'          => $invoice->customer_id,
            'plan_id'              => $invoice->plan_id,
            'card_token_id'        => $cardToken->id,
            'status'               => $status,
            'current_period_start' => $periodStart,
            'current_period_end'   => $periodEnd,
            'trial_ends_at'        => $trialEndsAt,
        ]);

        $invoice->update([
            'status'          => InvoiceStatus::Paid,
            'subscription_id' => $subscription->id,
            'paid_at'         => now(),
        ]);
    });

    // Fire events AFTER the transaction commits — never inside it,
    // so a queued listener never runs for a transaction that rolled back.
    // wasRecovered = false because this is the initial checkout, not a retry.
    if ($subscription) {
        PaymentSucceeded::dispatch($invoice->fresh(), false);
        SubscriptionRenewed::dispatch($subscription->fresh());
    }

    return $this->buildResponse($invoice->fresh());
}

private function buildResponse(Invoice $invoice): JsonResponse
{
    $plan     = Plan::withoutGlobalScopes()->findOrFail($invoice->plan_id);
    $customer = Customer::withoutGlobalScopes()->findOrFail($invoice->customer_id);
    $merchant = Merchant::findOrFail($invoice->merchant_id);

    return response()->json([
        'status'  => $invoice->status->value,
        'invoice' => [
            'id'              => $invoice->id,
            'merchant_tx_ref' => $invoice->merchant_tx_ref,
            'status'          => $invoice->status->value,
            'amount'          => $invoice->amount,
        ],
        'metadata' => [
            'planName'      => $plan->name,
            'amount'        => $invoice->amount,
            'interval'      => $plan->interval,
            'customerName'  => $customer->name,
            'customerEmail' => $customer->email,
            'merchantName'  => $merchant->name,
        ],
    ]);
}
}