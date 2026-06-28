<?php

namespace App\Domain\Customers\Models;

use App\Domain\Billing\Models\Invoice;
use App\Domain\Subscriptions\Models\Subscription;
use App\Support\Concerns\BelongsToMerchant;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasUuids, HasFactory, BelongsToMerchant;

    protected $fillable = [
        'merchant_id',
        'name',
        'email',
        'phone',
        'nomba_customer_id',
    ];

    protected static function newFactory(): CustomerFactory
    {
        return CustomerFactory::new();
    }

    public function cardTokens(): HasMany
    {
        return $this->hasMany(CardToken::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
