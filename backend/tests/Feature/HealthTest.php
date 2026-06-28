<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_health_endpoint_is_green(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJson(['status' => 'ok', 'service' => 'fluxbill-api'])
            ->assertJsonPath('checks.database', 'ok');
    }

    public function test_health_response_carries_request_id_header(): void
    {
        $this->getJson('/api/health')->assertHeader('X-Request-Id');
    }
}
