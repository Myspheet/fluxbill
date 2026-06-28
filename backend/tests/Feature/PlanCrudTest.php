<?php

namespace Tests\Feature;

use App\Domain\Merchants\Models\Merchant;
use App\Domain\Plans\Models\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PlanCrudTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsMerchant(): Merchant
    {
        $merchant = Merchant::factory()->create();
        Sanctum::actingAs($merchant);

        return $merchant;
    }

    public function test_create_plan_applies_db_defaults(): void
    {
        $this->actingAsMerchant();

        $this->postJson('/api/plans', [
            'name' => 'Monthly Gym Membership',
            'amount' => 500000,
            'interval' => 'monthly',
            'trial_days' => 7,
        ])
            ->assertCreated()
            ->assertJsonPath('data.amount', 500000)
            ->assertJsonPath('data.currency', 'NGN')
            ->assertJsonPath('data.interval_count', 1)
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('data.trial_days', 7);
    }

    public function test_plan_create_auto_assigns_merchant_id(): void
    {
        $merchant = $this->actingAsMerchant();

        $id = $this->postJson('/api/plans', [
            'name' => 'P', 'amount' => 1000, 'interval' => 'weekly',
        ])->json('data.id');

        $this->assertDatabaseHas('plans', ['id' => $id, 'merchant_id' => $merchant->id]);
    }

    public function test_index_lists_only_own_plans(): void
    {
        $merchant = $this->actingAsMerchant();
        Plan::factory()->count(2)->create(['merchant_id' => $merchant->id]);
        Plan::factory()->count(3)->create(); // other merchants

        $this->getJson('/api/plans')->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_update_plan(): void
    {
        $merchant = $this->actingAsMerchant();
        $plan = Plan::factory()->create(['merchant_id' => $merchant->id]);

        $this->patchJson("/api/plans/{$plan->id}", ['amount' => 750000])
            ->assertOk()
            ->assertJsonPath('data.amount', 750000);
    }

    public function test_delete_archives_instead_of_hard_delete(): void
    {
        $merchant = $this->actingAsMerchant();
        $plan = Plan::factory()->create(['merchant_id' => $merchant->id]);

        $this->deleteJson("/api/plans/{$plan->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'archived');

        $this->assertDatabaseHas('plans', ['id' => $plan->id, 'status' => 'archived']);
    }

    public function test_create_plan_validates_amount(): void
    {
        $this->actingAsMerchant();

        $this->postJson('/api/plans', ['name' => 'P', 'amount' => 0, 'interval' => 'monthly'])
            ->assertStatus(422)
            ->assertJsonPath('error.field', 'amount');
    }

    public function test_plans_require_authentication(): void
    {
        $this->getJson('/api/plans')->assertStatus(401);
    }
}
