<?php

namespace App\Domain\Merchants\Actions;

use App\Domain\Merchants\Models\Merchant;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Use case: authenticate a merchant by email + password.
 * Throws a validation error (rendered as the standardised 422 shape) on failure,
 * so existence of an email is never leaked via a distinct status.
 */
class AuthenticateMerchant
{
    /**
     * @throws ValidationException
     */
    public function handle(string $email, string $password): Merchant
    {
        $merchant = Merchant::where('email', $email)->first();

        if (! $merchant || ! Hash::check($password, $merchant->password_hash)) {
            throw ValidationException::withMessages([
                'email' => 'The provided credentials are incorrect.',
            ]);
        }

        return $merchant;
    }
}
