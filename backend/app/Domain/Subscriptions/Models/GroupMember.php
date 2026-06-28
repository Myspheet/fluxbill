<?php

namespace App\Domain\Subscriptions\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A seat within a group_subscription. */
class GroupMember extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'group_subscription_id',
        'name',
        'email',
        'phone',
        'status',
    ];

    public function groupSubscription(): BelongsTo
    {
        return $this->belongsTo(GroupSubscription::class);
    }
}
