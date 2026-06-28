<?php

namespace App\Domain\AI\Models;

use App\Domain\Subscriptions\Models\Subscription;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** AI churn score per subscription per cycle. */
class ChurnScore extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'subscription_id',
        'risk',
        'score',
        'reason',
        'signals_snapshot',
        'calculated_at',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'signals_snapshot' => 'array',
            'calculated_at' => 'datetime',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(RecoveryRecommendation::class);
    }
}
