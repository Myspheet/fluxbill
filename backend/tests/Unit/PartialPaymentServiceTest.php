<?php

namespace Tests\Unit;

use App\Domain\Billing\PartialPaymentService;
use PHPUnit\Framework\TestCase;

class PartialPaymentServiceTest extends TestCase
{
    private PartialPaymentService $service;

    private const TOLERANCE = 5000; // kobo

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PartialPaymentService;
    }

    public function test_exact_payment_is_paid(): void
    {
        $r = $this->service->reconcile(500000, 500000, self::TOLERANCE);
        $this->assertSame('paid', $r['status']);
        $this->assertSame(0, $r['overpayment_amount']);
        $this->assertSame(0, $r['amount_remaining']);
    }

    public function test_overpayment_is_paid_and_surfaces_credit(): void
    {
        $r = $this->service->reconcile(500000, 510000, self::TOLERANCE);
        $this->assertSame('paid', $r['status']);
        $this->assertSame(10000, $r['overpayment_amount']);
        $this->assertSame(0, $r['amount_remaining']);
    }

    public function test_shortfall_within_tolerance_is_paid(): void
    {
        // 4,000 short, tolerance 5,000 -> treated as paid, nothing owed.
        $r = $this->service->reconcile(500000, 496000, self::TOLERANCE);
        $this->assertSame('paid', $r['status']);
        $this->assertTrue($r['within_tolerance']);
        $this->assertSame(0, $r['amount_remaining']);
        $this->assertSame(0, $r['overpayment_amount']);
    }

    public function test_shortfall_beyond_tolerance_is_partially_paid(): void
    {
        // 10,000 short, beyond tolerance -> surfaced, never silently absorbed.
        $r = $this->service->reconcile(500000, 490000, self::TOLERANCE);
        $this->assertSame('partially_paid', $r['status']);
        $this->assertFalse($r['within_tolerance']);
        $this->assertSame(490000, $r['amount_received']);
        $this->assertSame(10000, $r['amount_remaining']);
    }

    public function test_shortfall_exactly_at_tolerance_is_paid(): void
    {
        $r = $this->service->reconcile(500000, 495000, self::TOLERANCE); // exactly 5,000 short
        $this->assertSame('paid', $r['status']);
    }
}
