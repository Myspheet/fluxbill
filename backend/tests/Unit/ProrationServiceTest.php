<?php

namespace Tests\Unit;

use App\Domain\Billing\ProrationService;
use PHPUnit\Framework\TestCase;

class ProrationServiceTest extends TestCase
{
    private ProrationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProrationService;
    }

    /** The worked example from docs/04 §5: ₦5,000 -> ₦10,000 on day 15 of 30. */
    public function test_upgrade_worked_example(): void
    {
        $result = $this->service->calculate(500000, 1000000, 30, 15);

        $this->assertSame(250000, $result['unused_credit']);   // unused old plan
        $this->assertSame(500000, $result['new_plan_charge']); // new plan, remaining days
        $this->assertSame(250000, $result['net_amount']);      // charged now
        $this->assertSame(15, $result['days_remaining']);
        $this->assertSame('upgrade', $result['change_type']);
    }

    public function test_downgrade_yields_negative_net_credit_owed(): void
    {
        $result = $this->service->calculate(1000000, 500000, 30, 15);

        $this->assertSame(500000, $result['unused_credit']);
        $this->assertSame(250000, $result['new_plan_charge']);
        $this->assertSame(-250000, $result['net_amount']); // negative = credit owed
        $this->assertSame('downgrade', $result['change_type']);
    }

    public function test_equal_amounts_net_zero(): void
    {
        $result = $this->service->calculate(500000, 500000, 30, 10);
        $this->assertSame(0, $result['net_amount']);
        $this->assertSame('upgrade', $result['change_type']); // >= counts as upgrade
    }

    public function test_days_remaining_is_clamped_to_period(): void
    {
        // More days remaining than the period -> clamped to the full period.
        $result = $this->service->calculate(500000, 1000000, 30, 99);
        $this->assertSame(30, $result['days_remaining']);
        $this->assertSame(500000, $result['unused_credit']);

        // Negative remaining -> clamped to zero, nothing prorated.
        $zero = $this->service->calculate(500000, 1000000, 30, -5);
        $this->assertSame(0, $zero['days_remaining']);
        $this->assertSame(0, $zero['unused_credit']);
        $this->assertSame(0, $zero['new_plan_charge']);
    }

    public function test_zero_period_length_does_not_divide_by_zero(): void
    {
        $result = $this->service->calculate(500000, 1000000, 0, 0);
        $this->assertSame(0, $result['days_remaining']);
    }
}
