<?php

namespace App\Domain\Portal\Models;

use App\Domain\Subscriptions\Models\Subscription;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Single-use, time-limited customer portal link. Token stored as SHA-256 hash. */
class PortalToken extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'subscription_id',
        'token',
        'expires_at',
        'used',
    ];

    protected $hidden = [
        'token',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used' => 'boolean',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
