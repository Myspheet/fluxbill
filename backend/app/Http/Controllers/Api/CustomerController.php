<?php

namespace App\Http\Controllers\Api;

use App\Domain\Customers\Models\Customer;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    /**
     * List all customers with their active subscriptions and plans
     */
    public function index(): JsonResponse
    {
        // MerchantScope automatically applies to Customer, Subscription, and Invoice.
        $customers = Customer::with([
            'subscriptions.plan',
            'subscriptions.cardToken',
            'invoices'
        ])
        ->latest()
        ->get()
        ->map(fn (Customer $c) => [
            'id' => $c->id,
            'name' => $c->name,
            'email' => $c->email,
            'phone' => $c->phone,
            'created_at' => $c->created_at->toIso8601String(),
            'subscriptions' => $c->subscriptions->map(fn ($s) => [
                'id' => $s->id,
                'status' => $s->status->value,
                'plan_name' => $s->plan?->name,
                'amount' => $s->plan?->amount,
                'interval' => $s->plan?->interval,
                'current_period_end' => $s->current_period_end ? $s->current_period_end->toIso8601String() : null,
                'card_last_four' => $s->cardToken?->last_four,
            ]),
            'total_invoices_count' => $c->invoices->count(),
            'total_paid_amount' => (int) $c->invoices->filter(fn ($inv) => $inv->status->isSettled())->sum('amount'),
        ]);

        return response()->json([
            'data' => $customers
        ]);
    }
}
