<?php

namespace App\Domain\Billing\Models;

use App\Domain\Subscriptions\Models\Subscription;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Downgrade credit, applied to the next invoice (not refunded immediately). */
class PlanChangeCredit extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'subscription_id',
        'credit_amount',
        'applied',
        'applied_to_invoice_id',
    ];

    protected function casts(): array
    {
        return [
            'credit_amount' => 'integer',
            'applied' => 'boolean',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function appliedToInvoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'applied_to_invoice_id');
    }
}
