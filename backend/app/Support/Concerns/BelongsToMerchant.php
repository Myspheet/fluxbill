<?php

namespace App\Support\Concerns;

use App\Domain\Merchants\Models\Merchant;
use App\Support\Scopes\MerchantScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Applied to Plan, Subscription, Invoice, Customer.
 *
 * - Registers the global MerchantScope (reads on these models are tenant-filtered).
 * - Auto-fills merchant_id from the authenticated merchant on create, so a
 *   controller can never forget to set it (and can't set someone else's).
 */
trait BelongsToMerchant
{
    public static function bootBelongsToMerchant(): void
    {
        static::addGlobalScope(new MerchantScope);

        static::creating(function ($model) {
            if (empty($model->merchant_id) && ($merchant = auth()->user()) instanceof Merchant) {
                $model->merchant_id = $merchant->getKey();
            }
        });
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }
}
