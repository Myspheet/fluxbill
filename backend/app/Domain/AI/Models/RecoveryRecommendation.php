<?php

namespace App\Domain\AI\Models;

use App\Domain\Subscriptions\Models\Subscription;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** The "copilot" action attached to a churn score. */
class RecoveryRecommendation extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'churn_score_id',
        'subscription_id',
        'recommendation',
        'expected_recovery_amount',
        'expected_recovery_pct',
        'action_taken',
        'outcome',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'expected_recovery_amount' => 'integer',
            'expected_recovery_pct' => 'integer',
            'resolved_at' => 'datetime',
        ];
    }

    public function churnScore(): BelongsTo
    {
        return $this->belongsTo(ChurnScore::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
