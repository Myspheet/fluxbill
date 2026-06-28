<?php

namespace App\Domain\Billing\Enums;

/** The 8-status invoice lifecycle. See docs/03-STATE-MACHINE.md. */
enum InvoiceStatus: string
{
    case Draft = 'draft';
    case Open = 'open';
    case Paid = 'paid';
    case PastDue = 'past_due';
    case Failed = 'failed';
    /** Paid after >=1 prior failed attempt -> source of the recovered-revenue hero metric. */
    case Recovered = 'recovered';
    case PartiallyPaid = 'partially_paid';
    case Void = 'void';

    /** Statuses that count as settled (no further charge needed). */
    public function isSettled(): bool
    {
        return in_array($this, [self::Paid, self::Recovered], true);
    }
}
