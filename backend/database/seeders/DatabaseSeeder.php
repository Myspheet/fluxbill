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

        Merchant::firstOrCreate(
            ['email' => 'admin1@fluxbill.app'],
            [
                'name' => 'Super Admin 1',
                'password_hash' => Hash::make('password'),
                'webhook_secret' => 'whsec_'.Str::random(40),
                'fee_billing_model' => 'percentage',
                'fee_rate' => 0,
                'is_admin' => true,
            ]
        );

        Merchant::firstOrCreate(
            ['email' => 'admin2@fluxbill.app'],
            [
                'name' => 'Super Admin 2',
                'password_hash' => Hash::make('password'),
                'webhook_secret' => 'whsec_'.Str::random(40),
                'fee_billing_model' => 'percentage',
                'fee_rate' => 0,
                'is_admin' => true,
            ]
        );

        if ($merchant->plans()->count() === 0) {
            Plan::create([
                'merchant_id' => $merchant->id,
                'name' => 'Monthly Gym Membership',
                'description' => 'Access to gym equipment, lockers, and showers.',
                'amount' => 500000,
                'currency' => 'NGN',
                'interval' => 'monthly',
                'interval_count' => 1,
                'trial_days' => 7,
                'status' => 'active',
            ]);
            Plan::create([
                'merchant_id' => $merchant->id,
                'name' => 'Annual Gym Membership',
                'description' => 'Unlimited yearly access with personal training.',
                'amount' => 5000000,
                'currency' => 'NGN',
                'interval' => 'annual',
                'interval_count' => 1,
                'trial_days' => 0,
                'status' => 'active',
            ]);
        }
    }
}
