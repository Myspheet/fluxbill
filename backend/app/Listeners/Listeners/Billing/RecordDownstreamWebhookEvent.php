<?php

namespace App\Listeners\Listeners\Billing;

use App\Events\PaymentSucceeded;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class RecordDownstreamWebhookEvent implements ShouldQueue
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(PaymentSucceeded $event): void
    {
        $this->handlePaymentSucceeded($event);
        $this->record($event->invoice->merchant_id, $event->wasRecovered ? 'invoice.recovered' : 'invoice.paid', [
            'invoice_id' => $event->invoice->id,
            'subscription_id' => $event->invoice->subscription_id,
            'amount' => $event->invoice->amount,
        ]);
    }

    public function handlePaymentFailed(PaymentFailed $event): void
    {
        $this->record($event->invoice->merchant_id, 'invoice.payment_failed', [
            'invoice_id' => $event->invoice->id,
            'decline_reason' => $event->declineReason,
            'attempt_number' => $event->attemptNumber,
        ]);
    }

    public function handleSubscriptionRenewed(SubscriptionRenewed $event): void
    {
        $this->record($event->subscription->merchant_id, 'subscription.renewed', [
            'subscription_id' => $event->subscription->id,
            'current_period_end' => $event->subscription->current_period_end,
        ]);
    }

    public function handleSubscriptionPastDue(SubscriptionPastDue $event): void
    {
        $this->record($event->subscription->merchant_id, 'subscription.past_due', [
            'subscription_id' => $event->subscription->id,
        ]);
    }

    protected function record(string $merchantId, string $eventType, array $payload): void
    {
        $record = SubscriptionEvent::create([
            'merchant_id' => $merchantId,
            'event_type' => $eventType,
            'payload' => $payload,
            'delivered' => false,
        ]);

        DeliverMerchantWebhookJob::dispatch($record);
    }

    public function subscribe($events): void
    {
        $events->listen(PaymentSucceeded::class, [self::class, 'handlePaymentSucceeded']);
        $events->listen(PaymentFailed::class, [self::class, 'handlePaymentFailed']);
        $events->listen(SubscriptionRenewed::class, [self::class, 'handleSubscriptionRenewed']);
        $events->listen(SubscriptionPastDue::class, [self::class, 'handleSubscriptionPastDue']);
    }
}
