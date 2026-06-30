<?php

namespace App\Mail;

use App\Domain\Billing\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SubscriptionSuccessMail extends Mailable
{
    use Queueable, SerializesModels;

    public Invoice $invoice;
    public string $customerName;
    public string $planName;
    public string $formattedAmount;

    public function __construct(Invoice $invoice, string $customerName, string $planName, string $formattedAmount)
    {
        $this->invoice = $invoice;
        $this->customerName = $customerName;
        $this->planName = $planName;
        $this->formattedAmount = $formattedAmount;
    }

    public function build(): self
    {
        return $this->subject('Subscription Confirmed!')
            ->html("
                <h2>Subscription Successful!</h2>
                <p>Hello {$this->customerName},</p>
                <p>Your subscription to <strong>{$this->planName}</strong> is now active.</p>
                <p><strong>Payment details:</strong></p>
                <ul>
                    <li>Amount Billed: {$this->formattedAmount}</li>
                    <li>Transaction Reference: <code>{$this->invoice->merchant_tx_ref}</code></li>
                    <li>Status: Active</li>
                </ul>
                <p>You can manage your subscription settings at any time using your customer portal.</p>
                <br>
                <p>Best regards,<br>The FluxBill Team</p>
            ");
    }
}
