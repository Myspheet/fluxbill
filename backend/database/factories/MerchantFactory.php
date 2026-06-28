<?php

namespace Database\Factories;

use App\Domain\Merchants\Models\Merchant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/** @extends Factory<Merchant> */
class MerchantFactory extends Factory
{
    protected $model = Merchant::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'email' => fake()->unique()->safeEmail(),
            'password_hash' => Hash::make('password'),
            'webhook_url' => null,
            'webhook_secret' => 'whsec_'.Str::random(40),
            'fee_billing_model' => 'percentage',
            'fee_rate' => 150,
        ];
    }
}
