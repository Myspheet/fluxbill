<?php

namespace App\Support\Scopes;

use App\Domain\Merchants\Models\Merchant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Tenant isolation — applied once, globally, so it can never be silently
 * omitted in a controller (docs/09 §1).
 *
 * When a merchant is authenticated, every query on a scoped model is filtered
 * to that merchant's rows. When there is NO authenticated merchant (public
 * subscribe, customer portal, the Nomba webhook, queued jobs, the scheduler,
 * artisan/console), the scope is a deliberate no-op — those contexts resolve
 * their own row by token/reference and have no merchant in session.
 *
 * Cross-merchant lookups therefore return zero rows -> the controller's
 * findOrFail yields 404 (not 403), so another merchant's data never leaks.
 */
class MerchantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $merchant = auth()->user();

        if ($merchant instanceof Merchant) {
            $builder->where($model->getTable().'.merchant_id', $merchant->getKey());
        }
    }
}
