<?php

namespace App\Domain\Subscriptions\Models;

use App\Domain\Merchants\Models\Merchant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Outbound event log (also the basis of the audit trail). */
class SubscriptionEvent extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'merchant_id',
        'subscription_id',
        'event_type',
        'payload',
        'delivered',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'delivered' => 'boolean',
            'delivered_at' => 'datetime',
        ];
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
