<?php

namespace App\Mail;

use App\Domain\Billing\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SubscriptionFailureMail extends Mailable
{
    use Queueable, SerializesModels;

    public Invoice $invoice;
    public string $customerName;
    public string $planName;
    public string $reason;
    public ?string $portalUrl;

    public function __construct(Invoice $invoice, string $customerName, string $planName, string $reason, ?string $portalUrl = null)
    {
        $this->invoice = $invoice;
        $this->customerName = $customerName;
        $this->planName = $planName;
        $this->reason = $reason;
        $this->portalUrl = $portalUrl;
    }

    public function build(): self
    {
        $actionHtml = "";
        if ($this->portalUrl) {
            $actionHtml = "<p>Please click here to update your card details: <a href='{$this->portalUrl}'>{$this->portalUrl}</a></p>";
        }

        return $this->subject('Action Required: Subscription Payment Failed')
            ->html("
                <h2>Subscription Payment Failed</h2>
                <p>Hello {$this->customerName},</p>
                <p>We were unable to charge your card for your subscription to <strong>{$this->planName}</strong>.</p>
                <p><strong>Decline Reason:</strong> <code>{$this->reason}</code></p>
                {$actionHtml}
                <p>If this issue persists, your access may be temporarily suspended. Please verify your funding or update your card to avoid interruptions.</p>
                <br>
                <p>Best regards,<br>The FluxBill Team</p>
            ");
    }
}
