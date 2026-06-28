<?php

namespace App\Domain\Plans\Models;

use App\Domain\Billing\Models\Invoice;
use App\Domain\Subscriptions\Models\Subscription;
use App\Support\Concerns\BelongsToMerchant;
use Database\Factories\PlanFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasUuids, HasFactory, BelongsToMerchant;

    protected $fillable = [
        'merchant_id',
        'name',
        'description',
        'amount',
        'currency',
        'interval',
        'interval_count',
        'trial_days',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'interval_count' => 'integer',
            'trial_days' => 'integer',
        ];
    }

    protected static function newFactory(): PlanFactory
    {
        return PlanFactory::new();
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
