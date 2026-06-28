<?php

namespace Tests\Unit;

use App\Domain\Billing\DunningRouter;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

class DunningRouterTest extends TestCase
{
    private DunningRouter $router;

    protected function setUp(): void
    {
        parent::setUp();
        $this->router = new DunningRouter;
        // Freeze time so next_attempt_at assertions are exact.
        Carbon::setTestNow(Carbon::parse('2026-07-04 09:00:00'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_insufficient_funds_retries_on_standard_schedule(): void
    {
        $action = $this->router->nextAction(DunningRouter::REASON_INSUFFICIENT_FUNDS, 1);

        $this->assertTrue($action['retry']);
        $this->assertTrue(Carbon::now()->addDays(3)->equalTo($action['next_attempt_at']));
    }

    public function test_insufficient_funds_stops_after_attempt_four(): void
    {
        $this->assertFalse($this->router->nextAction(DunningRouter::REASON_INSUFFICIENT_FUNDS, 4)['retry']);
    }

    public function test_expired_card_is_never_retried_and_requests_card_update(): void
    {
        foreach ([
            DunningRouter::REASON_CARD_EXPIRED,
            DunningRouter::REASON_FROZEN_CARD,
            DunningRouter::REASON_STOLEN_CARD,
        ] as $reason) {
            $action = $this->router->nextAction($reason, 1);
            $this->assertFalse($action['retry'], "$reason must not retry");
            $this->assertSame('request_card_update', $action['action']);
            $this->assertArrayNotHasKey('next_attempt_at', $action);
        }
    }

    public function test_do_not_honor_retries_once_then_stops(): void
    {
        $first = $this->router->nextAction(DunningRouter::REASON_DO_NOT_HONOR, 1);
        $this->assertTrue($first['retry']);
        $this->assertTrue(Carbon::now()->addDays(3)->equalTo($first['next_attempt_at']));

        $second = $this->router->nextAction(DunningRouter::REASON_DO_NOT_HONOR, 2);
        $this->assertFalse($second['retry']);
    }

    public function test_bank_unavailable_retries_fast_and_quietly(): void
    {
        $action = $this->router->nextAction(DunningRouter::REASON_BANK_UNAVAILABLE, 1);

        $this->assertTrue($action['retry']);
        $this->assertFalse($action['customer_facing_alert']);
        $this->assertTrue(Carbon::now()->addHours(4)->equalTo($action['next_attempt_at']));
    }

    public function test_unknown_reason_falls_back_to_standard_schedule(): void
    {
        $action = $this->router->nextAction('SOME_NEW_NOMBA_CODE', 2);

        $this->assertTrue($action['retry']);
        $this->assertTrue(Carbon::now()->addDays(5)->equalTo($action['next_attempt_at']));
    }

    public function test_standard_schedule_escalates(): void
    {
        $this->assertTrue(Carbon::now()->addDays(3)->equalTo($this->router->standardScheduleFor(1)));
        $this->assertTrue(Carbon::now()->addDays(5)->equalTo($this->router->standardScheduleFor(2)));
        $this->assertTrue(Carbon::now()->addDays(7)->equalTo($this->router->standardScheduleFor(3)));
        $this->assertTrue(Carbon::now()->addDays(7)->equalTo($this->router->standardScheduleFor(9)));
    }
}
