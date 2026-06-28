<?php

namespace Tests\Feature;

use App\Domain\Merchants\Models\Merchant;
use App\Domain\Plans\Models\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * The global MerchantScope is the one rule enforced everywhere (docs/09 §1).
 * Cross-merchant access must 404 (never 403) so existence isn't leaked.
 */
class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_merchant_cannot_read_another_merchants_plan(): void
    {
        $merchantA = Merchant::factory()->create();
        $planA = Plan::factory()->create(['merchant_id' => $merchantA->id]);

        $merchantB = Merchant::factory()->create();
        Sanctum::actingAs($merchantB);

        $this->getJson("/api/plans/{$planA->id}")
            ->assertStatus(404)
            ->assertJsonPath('error.code', 'not_found');
    }

    public function test_merchant_cannot_update_another_merchants_plan(): void
    {
        $merchantA = Merchant::factory()->create();
        $planA = Plan::factory()->create(['merchant_id' => $merchantA->id]);

        $merchantB = Merchant::factory()->create();
        Sanctum::actingAs($merchantB);

        $this->patchJson("/api/plans/{$planA->id}", ['amount' => 1])
            ->assertStatus(404);

        // Untouched.
        $this->assertDatabaseHas('plans', ['id' => $planA->id, 'amount' => $planA->amount]);
    }

    public function test_merchant_index_excludes_other_merchants_plans(): void
    {
        $merchantA = Merchant::factory()->create();
        Plan::factory()->count(2)->create(['merchant_id' => $merchantA->id]);

        $merchantB = Merchant::factory()->create();
        Sanctum::actingAs($merchantB);

        $this->getJson('/api/plans')->assertOk()->assertJsonCount(0, 'data');
    }
}
