<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Domain\Merchants\Models\Merchant */
class MerchantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'webhook_url' => $this->webhook_url,
            'fee_billing_model' => $this->fee_billing_model,
            'fee_rate' => (int) $this->fee_rate,
            'is_admin' => (bool) $this->is_admin,
        ];
    }
}
