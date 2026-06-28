<?php

namespace App\Domain\Billing\Models;

use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Customers\Models\Customer;
use App\Domain\Plans\Models\Plan;
use App\Domain\Subscriptions\Models\Subscription;
use App\Support\Concerns\BelongsToMerchant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** The central ledger record. */
class Invoice extends Model
{
    use HasUuids, HasFactory, BelongsToMerchant;

    protected $fillable = [
        'merchant_id',
        'subscription_id',
        'customer_id',
        'plan_id',
        'amount',
        'status',
        'merchant_tx_ref',
        'last_attempt_tx_ref',
        'attempt_count',
        'next_attempt_at',
        'decline_reason',
        'virtual_account_ref',
        'amount_received',
        'amount_remaining',
        'paid_at',
        'recovered_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => InvoiceStatus::class,
            'amount' => 'integer',
            'attempt_count' => 'integer',
            'amount_received' => 'integer',
            'amount_remaining' => 'integer',
            'next_attempt_at' => 'datetime',
            'paid_at' => 'datetime',
            'recovered_at' => 'datetime',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function dunningAttempts(): HasMany
    {
        return $this->hasMany(DunningAttempt::class);
    }

    public function overpaymentCredits(): HasMany
    {
        return $this->hasMany(OverpaymentCredit::class);
    }
}
