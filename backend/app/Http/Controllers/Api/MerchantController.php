<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MerchantResource;
use Illuminate\Http\Request;

class MerchantController extends Controller
{
    /**
     * Update webhook URL
     *
     * Set where FluxBill delivers downstream webhooks for the authenticated merchant.
     */
    public function updateWebhook(Request $request): MerchantResource
    {
        $validated = $request->validate([
            'webhook_url' => ['required', 'url', 'max:2048'],
        ]);

        $merchant = $request->user();
        $merchant->update(['webhook_url' => $validated['webhook_url']]);

        return new MerchantResource($merchant);
    }
}
