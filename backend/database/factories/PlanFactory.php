<?php

namespace Database\Factories;

use App\Domain\Merchants\Models\Merchant;
use App\Domain\Plans\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Plan> */
class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        return [
            'merchant_id' => Merchant::factory(),
            'name' => fake()->words(2, true),
            'description' => null,
            'amount' => 500000, // ₦5,000 in kobo
            'currency' => 'NGN',
            'interval' => 'monthly',
            'interval_count' => 1,
            'trial_days' => 0,
            'status' => 'active',
        ];
    }
}
