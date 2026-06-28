<?php

namespace App\Domain\Subscriptions;

use App\Domain\Subscriptions\Enums\SubscriptionStatus;
use App\Domain\Subscriptions\Models\Subscription;
use App\Exceptions\InvalidSubscriptionStateException;

/**
 * The 9-state subscription lifecycle guard (docs/03 §2).
 *
 * Encodes exactly the transition table from the docs. Illegal transitions are
 * refused (so e.g. a cancelled subscription can never become active again, and
 * change-plan on a cancelled sub is rejected). Pure logic, exhaustively tested.
 */
class SubscriptionStateMachine
{
    /**
     * Allowed transitions: from-state => [to-states].
     * Terminal states (cancelled, expired) intentionally have no entries.
     *
     * @var array<string, list<string>>
     */
    private const TRANSITIONS = [
        'trialing' => ['active', 'cancelled'],
        'active' => ['past_due', 'cancel_at_period_end', 'paused', 'expired'],
        'past_due' => ['active', 'grace_period', 'access_suspended', 'paused'],
        'grace_period' => ['active', 'access_suspended'],
        'access_suspended' => ['active', 'cancelled'],
        'paused' => ['active'],
        'cancel_at_period_end' => ['cancelled'],
        'cancelled' => [],
        'expired' => [],
    ];

    public function allowedTransitions(SubscriptionStatus $from): array
    {
        return array_map(
            static fn (string $s) => SubscriptionStatus::from($s),
            self::TRANSITIONS[$from->value] ?? [],
        );
    }

    public function canTransition(SubscriptionStatus $from, SubscriptionStatus $to): bool
    {
        return in_array($to->value, self::TRANSITIONS[$from->value] ?? [], true);
    }

    /**
     * @throws InvalidSubscriptionStateException
     */
    public function assertCanTransition(SubscriptionStatus $from, SubscriptionStatus $to): void
    {
        if (! $this->canTransition($from, $to)) {
            throw new InvalidSubscriptionStateException(
                "Illegal subscription transition: {$from->value} -> {$to->value}."
            );
        }

        if ($from->isTerminal()) {
            throw new InvalidSubscriptionStateException(
                "Subscription is in a terminal state ({$from->value}) and cannot transition."
            );
        }
    }

    /**
     * Apply a transition to a subscription model after guarding it.
     * (Persistence/side-effects belong to the in-window billing engine; this
     * just sets the validated status.)
     *
     * @throws InvalidSubscriptionStateException
     */
    public function transition(Subscription $subscription, SubscriptionStatus $to): Subscription
    {
        $from = $subscription->status instanceof SubscriptionStatus
            ? $subscription->status
            : SubscriptionStatus::from((string) $subscription->status);

        $this->assertCanTransition($from, $to);
        $subscription->status = $to;

        return $subscription;
    }
}
