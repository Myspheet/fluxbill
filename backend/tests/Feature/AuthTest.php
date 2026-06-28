<?php

namespace Tests\Feature;

use App\Domain\Merchants\Models\Merchant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_merchant_can_register_and_receives_token_and_webhook_secret_once(): void
    {
        $response = $this->postJson('/api/merchants/register', [
            'name' => 'Adaeze Gym',
            'email' => 'owner@adaezegym.com',
            'password' => 'secret123',
            'webhook_url' => 'https://gym.example.com/webhooks/fluxbill',
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'merchant' => ['id', 'name', 'email'],
                'token',
                'webhook_secret',
            ]);

        $this->assertStringStartsWith('whsec_', $response->json('webhook_secret'));
        $this->assertDatabaseHas('merchants', ['email' => 'owner@adaezegym.com']);
        // Secret is not part of the merchant resource (shown once, never again).
        $response->assertJsonMissingPath('merchant.webhook_secret');
    }

    public function test_register_rejects_duplicate_email_with_standardised_error(): void
    {
        Merchant::factory()->create(['email' => 'dupe@x.com']);

        $this->postJson('/api/merchants/register', [
            'name' => 'X',
            'email' => 'dupe@x.com',
            'password' => 'secret123',
        ])
            ->assertStatus(422)
            ->assertJsonPath('error.code', 'validation_failed')
            ->assertJsonPath('error.field', 'email');
    }

    public function test_register_validates_password_length(): void
    {
        $this->postJson('/api/merchants/register', [
            'name' => 'X',
            'email' => 'a@b.com',
            'password' => 'short',
        ])
            ->assertStatus(422)
            ->assertJsonPath('error.field', 'password');
    }

    public function test_merchant_can_login_with_correct_credentials(): void
    {
        Merchant::factory()->create(['email' => 'login@x.com']); // factory password = "password"

        $this->postJson('/api/auth/login', [
            'email' => 'login@x.com',
            'password' => 'password',
        ])->assertOk()->assertJsonStructure(['merchant', 'token']);
    }

    public function test_login_with_wrong_password_is_rejected(): void
    {
        Merchant::factory()->create(['email' => 'login2@x.com']);

        $this->postJson('/api/auth/login', [
            'email' => 'login2@x.com',
            'password' => 'wrong-password',
        ])
            ->assertStatus(422)
            ->assertJsonPath('error.code', 'validation_failed');
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/auth/me')
            ->assertStatus(401)
            ->assertJsonPath('error.code', 'unauthenticated');
    }

    public function test_me_returns_authenticated_merchant(): void
    {
        $merchant = Merchant::factory()->create();
        Sanctum::actingAs($merchant);

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $merchant->id);
    }
}
