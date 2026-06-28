<?php

namespace App\Support;

/**
 * Money helpers. FluxBill stores and computes everything in kobo (integer);
 * float is never used for money. These helpers exist for display/conversion at
 * the edges only.
 */
final class Money
{
    /** ₦1 = 100 kobo. */
    public const KOBO_PER_NAIRA = 100;

    /** Convert a naira amount to integer kobo (rounded to the nearest kobo). */
    public static function nairaToKobo(int|float|string $naira): int
    {
        return (int) round(((float) $naira) * self::KOBO_PER_NAIRA);
    }

    /** Whole/decimal naira value of a kobo amount (for computation, not display). */
    public static function koboToNaira(int $kobo): float
    {
        return $kobo / self::KOBO_PER_NAIRA;
    }

    /** Human-readable naira string, e.g. 500000 -> "₦5,000.00". */
    public static function format(int $kobo): string
    {
        return '₦'.number_format($kobo / self::KOBO_PER_NAIRA, 2);
    }
}
