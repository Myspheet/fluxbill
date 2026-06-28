<?php

namespace App\Domain\Merchants\Models;

use App\Domain\Billing\Models\Invoice;
use App\Domain\Customers\Models\Customer;
use App\Domain\Plans\Models\Plan;
use App\Domain\Subscriptions\Models\GroupSubscription;
use App\Domain\Subscriptions\Models\Subscription;
use App\Domain\Subscriptions\Models\SubscriptionEvent;
use Database\Factories\MerchantFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * The business using FluxBill. The Sanctum-authenticated principal; merchant_id
 * on tenant-scoped models equals this model's id.
 */
class Merchant extends Authenticatable
{
    use HasApiTokens, HasUuids, HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password_hash',
        'nomba_sub_account_id',
        'nomba_sub_account_ref',
        'webhook_url',
        'webhook_secret',
        'fee_billing_model',
        'fee_rate',
    ];

    protected $hidden = [
        'password_hash',
        'webhook_secret',
    ];

    protected function casts(): array
    {
        return [
            'fee_rate' => 'integer',
        ];
    }

    /** Models live outside App\Models, so point the factory resolver explicitly. */
    protected static function newFactory(): MerchantFactory
    {
        return MerchantFactory::new();
    }

    /** Sanctum/auth reads the password from this column, not the default `password`. */
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function subscriptionEvents(): HasMany
    {
        return $this->hasMany(SubscriptionEvent::class);
    }

    public function groupSubscriptions(): HasMany
    {
        return $this->hasMany(GroupSubscription::class);
    }
}
