<?php

namespace App\Domain\Customers\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tokenized card from Nomba checkout. No PAN ever stored. */
class CardToken extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'customer_id',
        'nomba_card_id',
        'last_four',
        'card_brand',
        'status',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
