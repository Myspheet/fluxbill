<?php

namespace App\Domain\Subscriptions\Enums;

/**
 * The 9-state subscription lifecycle. See docs/03-STATE-MACHINE.md.
 * Transition legality is owned by App\Domain\Subscriptions\SubscriptionStateMachine.
 */
enum SubscriptionStatus: string
{
    case Trialing = 'trialing';
    case Active = 'active';
    case PastDue = 'past_due';
    case GracePeriod = 'grace_period';
    case AccessSuspended = 'access_suspended';
    case Paused = 'paused';
    case CancelAtPeriodEnd = 'cancel_at_period_end';
    case Cancelled = 'cancelled';
    case Expired = 'expired';

    /** Terminal states have no outgoing transitions. */
    public function isTerminal(): bool
    {
        return in_array($this, [self::Cancelled, self::Expired], true);
    }

    /** Does the customer currently have access to the product? */
    public function hasAccess(): bool
    {
        return in_array($this, [
            self::Trialing,
            self::Active,
            self::PastDue,
            self::GracePeriod,
            self::CancelAtPeriodEnd,
        ], true);
    }
}
