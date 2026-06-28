<?php

namespace Tests\Unit;

use App\Support\Money;
use PHPUnit\Framework\TestCase;

class MoneyTest extends TestCase
{
    public function test_naira_to_kobo(): void
    {
        $this->assertSame(500000, Money::nairaToKobo(5000));
        $this->assertSame(5050, Money::nairaToKobo(50.5));
        $this->assertSame(100, Money::nairaToKobo(1));
    }

    public function test_kobo_to_naira(): void
    {
        $this->assertSame(5000.0, Money::koboToNaira(500000));
    }

    public function test_format(): void
    {
        $this->assertSame('₦5,000.00', Money::format(500000));
        $this->assertSame('₦0.00', Money::format(0));
        $this->assertSame('₦1,234.56', Money::format(123456));
    }
}
