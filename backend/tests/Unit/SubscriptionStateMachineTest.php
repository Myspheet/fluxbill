<?php

namespace Tests\Unit;

use App\Domain\Subscriptions\Enums\SubscriptionStatus;
use App\Exceptions\InvalidSubscriptionStateException;
use App\Domain\Subscriptions\SubscriptionStateMachine;
use PHPUnit\Framework\TestCase;

class SubscriptionStateMachineTest extends TestCase
{
    private SubscriptionStateMachine $sm;

    protected function setUp(): void
    {
        parent::setUp();
        $this->sm = new SubscriptionStateMachine;
    }

    public function test_legal_dunning_path_transitions(): void
    {
        $this->assertTrue($this->sm->canTransition(SubscriptionStatus::Active, SubscriptionStatus::PastDue));
        $this->assertTrue($this->sm->canTransition(SubscriptionStatus::PastDue, SubscriptionStatus::GracePeriod));
        $this->assertTrue($this->sm->canTransition(SubscriptionStatus::GracePeriod, SubscriptionStatus::AccessSuspended));
        $this->assertTrue($this->sm->canTransition(SubscriptionStatus::AccessSuspended, SubscriptionStatus::Cancelled));
    }

    public function test_card_expired_skips_grace_straight_to_suspension(): void
    {
        // past_due -> access_suspended directly is legal (CARD_EXPIRED/FROZEN path).
        $this->assertTrue($this->sm->canTransition(SubscriptionStatus::PastDue, SubscriptionStatus::AccessSuspended));
    }

    public function test_any_failure_state_can_recover_to_active(): void
    {
        $this->assertTrue($this->sm->canTransition(SubscriptionStatus::PastDue, SubscriptionStatus::Active));
        $this->assertTrue($this->sm->canTransition(SubscriptionStatus::GracePeriod, SubscriptionStatus::Active));
        $this->assertTrue($this->sm->canTransition(SubscriptionStatus::AccessSuspended, SubscriptionStatus::Active));
    }

    public function test_cancel_at_period_end_keeps_access_until_period_end(): void
    {
        $this->assertTrue($this->sm->canTransition(SubscriptionStatus::Active, SubscriptionStatus::CancelAtPeriodEnd));
        $this->assertTrue($this->sm->canTransition(SubscriptionStatus::CancelAtPeriodEnd, SubscriptionStatus::Cancelled));
    }

    public function test_illegal_transitions_are_refused(): void
    {
        // active cannot jump straight to cancelled (must go via cancel_at_period_end / suspension).
        $this->assertFalse($this->sm->canTransition(SubscriptionStatus::Active, SubscriptionStatus::Cancelled));
        // trialing cannot go straight to past_due.
        $this->assertFalse($this->sm->canTransition(SubscriptionStatus::Trialing, SubscriptionStatus::PastDue));
    }

    public function test_terminal_states_have_no_transitions(): void
    {
        $this->assertSame([], $this->sm->allowedTransitions(SubscriptionStatus::Cancelled));
        $this->assertSame([], $this->sm->allowedTransitions(SubscriptionStatus::Expired));
        $this->assertFalse($this->sm->canTransition(SubscriptionStatus::Cancelled, SubscriptionStatus::Active));
    }

    public function test_assert_throws_on_illegal_transition(): void
    {
        $this->expectException(InvalidSubscriptionStateException::class);
        $this->sm->assertCanTransition(SubscriptionStatus::Cancelled, SubscriptionStatus::Active);
    }

    public function test_assert_passes_on_legal_transition(): void
    {
        $this->sm->assertCanTransition(SubscriptionStatus::Active, SubscriptionStatus::Paused);
        $this->expectNotToPerformAssertions();
    }
}
