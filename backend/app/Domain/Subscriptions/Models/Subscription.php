<?php

namespace App\Domain\Subscriptions\Models;

use App\Domain\AI\Models\ChurnScore;
use App\Domain\Billing\Models\DunningAttempt;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Models\PlanChangeCredit;
use App\Domain\Billing\Models\PlanChangeHistory;
use App\Domain\Customers\Models\CardToken;
use App\Domain\Customers\Models\Customer;
use App\Domain\Plans\Models\Plan;
use App\Domain\Portal\Models\PortalToken;
use App\Domain\Subscriptions\Enums\SubscriptionStatus;
use App\Support\Concerns\BelongsToMerchant;
use Database\Factories\SubscriptionFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    use HasUuids, HasFactory, BelongsToMerchant;

    protected $fillable = [
        'merchant_id',
        'customer_id',
        'plan_id',
        'status',
        'card_token_id',
        'current_period_start',
        'current_period_end',
        'trial_ends_at',
        'cancelled_at',
        'cancel_at_period_end',
        'pause_starts_at',
        'pause_ends_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => SubscriptionStatus::class,
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'trial_ends_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'cancel_at_period_end' => 'boolean',
            'pause_starts_at' => 'datetime',
            'pause_ends_at' => 'datetime',
        ];
    }

    protected static function newFactory(): SubscriptionFactory
    {
        return SubscriptionFactory::new();
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function cardToken(): BelongsTo
    {
        return $this->belongsTo(CardToken::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function dunningAttempts(): HasMany
    {
        return $this->hasMany(DunningAttempt::class);
    }

    public function planChangeHistory(): HasMany
    {
        return $this->hasMany(PlanChangeHistory::class);
    }

    public function planChangeCredits(): HasMany
    {
        return $this->hasMany(PlanChangeCredit::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(SubscriptionEvent::class);
    }

    public function churnScores(): HasMany
    {
        return $this->hasMany(ChurnScore::class);
    }

    public function portalTokens(): HasMany
    {
        return $this->hasMany(PortalToken::class);
    }
}
