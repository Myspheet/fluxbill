<?php

namespace App\Domain\Billing\Models;

use App\Domain\Subscriptions\Models\Subscription;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One row per retry attempt. Append-mostly (created_at only). */
class DunningAttempt extends Model
{
    use HasUuids, HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'invoice_id',
        'subscription_id',
        'attempt_number',
        'merchant_tx_ref',
        'status',
        'failure_reason',
        'attempted_at',
        'next_attempt_at',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'attempt_number' => 'integer',
            'attempted_at' => 'datetime',
            'next_attempt_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
