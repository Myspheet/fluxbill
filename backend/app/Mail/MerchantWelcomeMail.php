<?php

namespace App\Mail;

use App\Domain\Merchants\Models\Merchant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class MerchantWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public Merchant $merchant;

    public function __construct(Merchant $merchant)
    {
        $this->merchant = $merchant;
    }

    public function build(): self
    {
        return $this->subject('Welcome to FluxBill!')
            ->html("
                <h2>Welcome to FluxBill, {$this->merchant->name}!</h2>
                <p>Your merchant account is now active. You can begin creating subscription plans and integrating recurring payments.</p>
                <p>Log in to your dashboard here: <a href='" . config('app.frontend_url') . "/login'>" . config('app.frontend_url') . "/login</a></p>
                <br>
                <p>Best regards,<br>The FluxBill Team</p>
            ");
    }
}
