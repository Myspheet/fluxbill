<?php

namespace App\Domain\Merchants\Actions;

use App\Domain\Merchants\Models\Merchant;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Use case: register a new merchant.
 *
 * Pre-window this is pure DB. IN-WINDOW (1 July+) this same action also creates
 * the merchant's Nomba sub-account (POST /accounts/sub-accounts) and persists
 * nomba_sub_account_id / nomba_sub_account_ref — the one place that orchestration
 * lives, so the controller never has to know about Nomba.
 *
 * @param array{name:string,email:string,password:string,webhook_url?:string|null} $data
 */
class RegisterMerchant
{
    public function handle(array $data): Merchant
    {
        // Shown ONCE at register, never returned again (same pattern Nomba uses).
        $webhookSecret = 'whsec_'.Str::random(40);

        $merchant = Merchant::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password_hash' => Hash::make($data['password']),
            'webhook_url' => $data['webhook_url'] ?? null,
            'webhook_secret' => $webhookSecret,
            'fee_billing_model' => 'percentage',
            'fee_rate' => 150, // 1.5% — default for the simulated business-model dashboard
        ]);

        // IN-WINDOW: create Nomba sub-account here and update nomba_sub_account_*.

        return $merchant;
    }
}
