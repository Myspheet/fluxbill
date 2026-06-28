<?php

namespace App\Domain\Subscriptions\Models;

use App\Domain\Customers\Models\CardToken;
use App\Domain\Customers\Models\Customer;
use App\Domain\Merchants\Models\Merchant;
use App\Domain\Plans\Models\Plan;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Community Subscriptions: one leader pays for many seats. */
class GroupSubscription extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'merchant_id',
        'plan_id',
        'leader_customer_id',
        'seat_count',
        'status',
        'current_period_end',
        'card_token_id',
    ];

    protected function casts(): array
    {
        return [
            'seat_count' => 'integer',
            'current_period_end' => 'datetime',
        ];
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function leader(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'leader_customer_id');
    }

    public function cardToken(): BelongsTo
    {
        return $this->belongsTo(CardToken::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(GroupMember::class);
    }
}
