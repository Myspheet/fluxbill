<?php

namespace App\Domain\Billing\Models;

use App\Domain\Plans\Models\Plan;
use App\Domain\Subscriptions\Models\Subscription;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Audit of upgrades/downgrades. Feeds the AI churn signal `plan_downgrades`. */
class PlanChangeHistory extends Model
{
    use HasUuids, HasFactory;

    protected $table = 'plan_change_history';

    protected $fillable = [
        'subscription_id',
        'old_plan_id',
        'new_plan_id',
        'change_type',
        'unused_credit',
        'new_plan_charge',
        'net_amount',
        'days_remaining_at_change',
    ];

    protected function casts(): array
    {
        return [
            'unused_credit' => 'integer',
            'new_plan_charge' => 'integer',
            'net_amount' => 'integer',
            'days_remaining_at_change' => 'integer',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function oldPlan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'old_plan_id');
    }

    public function newPlan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'new_plan_id');
    }
}
