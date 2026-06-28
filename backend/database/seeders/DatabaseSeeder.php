<?php

namespace Database\Seeders;

use App\Domain\Merchants\Models\Merchant;
use App\Domain\Plans\Models\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed a demo merchant + a couple of plans (pure DB, no Nomba) so the
     * dashboard has something to show on first run.
     */
    public function run(): void
    {
        $merchant = Merchant::firstOrCreate(
            ['email' => 'demo@fluxbill.app'],
            [
                'name' => 'Adaeze Gym',
                'password_hash' => Hash::make('password'),
                'webhook_secret' => 'whsec_'.Str::random(40),
                'fee_billing_model' => 'percentage',
                'fee_rate' => 150,
            ],
        );

        if ($merchant->plans()->count() === 0) {
            Plan::factory()->create([
                'merchant_id' => $merchant->id,
                'name' => 'Monthly Gym Membership',
                'amount' => 500000,
                'interval' => 'monthly',
                'trial_days' => 7,
            ]);
            Plan::factory()->create([
                'merchant_id' => $merchant->id,
                'name' => 'Annual Gym Membership',
                'amount' => 5000000,
                'interval' => 'annual',
            ]);
        }
    }
}
