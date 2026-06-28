<?php

namespace Tests\Feature;

use App\Domain\Subscriptions\Models\Subscription;
use App\Domain\Portal\PortalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalServiceTest extends TestCase
{
    use RefreshDatabase;

    private PortalService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PortalService;
    }

    public function test_generate_stores_only_the_hash_never_the_plaintext(): void
    {
        $subscription = Subscription::factory()->create();

        $result = $this->service->generate($subscription);

        $plain = $result['plain_token'];
        $this->assertSame(40, strlen($plain));

        // The stored token is the SHA-256 hash, not the plaintext.
        $this->assertSame(hash('sha256', $plain), $result['portal_token']->token);
        $this->assertNotSame($plain, $result['portal_token']->token);
        $this->assertStringContainsString($plain, $result['portal_url']);
        $this->assertFalse($result['portal_token']->used);
    }

    public function test_resolve_returns_token_for_valid_plaintext(): void
    {
        $subscription = Subscription::factory()->create();
        $plain = $this->service->generate($subscription)['plain_token'];

        $this->assertNotNull($this->service->resolve($plain));
        $this->assertNull($this->service->resolve('not-a-real-token'));
    }

    public function test_consume_is_single_use(): void
    {
        $subscription = Subscription::factory()->create();
        $plain = $this->service->generate($subscription)['plain_token'];

        $resolved = $this->service->consume($plain);
        $this->assertNotNull($resolved);
        $this->assertTrue($resolved->is($subscription));

        // Second use is refused.
        $this->assertNull($this->service->consume($plain));
    }

    public function test_expired_token_does_not_resolve(): void
    {
        $subscription = Subscription::factory()->create();
        $result = $this->service->generate($subscription);
        $result['portal_token']->update(['expires_at' => now()->subMinute()]);

        $this->assertNull($this->service->resolve($result['plain_token']));
    }
}
