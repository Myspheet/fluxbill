<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when an operation is requested against a subscription/invoice whose
 * current state does not permit it (e.g. change-plan on a cancelled sub).
 * Rendered as HTTP 400 with code `invalid_subscription_state`.
 */
class InvalidSubscriptionStateException extends RuntimeException
{
    public function __construct(
        string $message = 'The subscription is not in a valid state for this action.',
        public string $errorCode = 'invalid_subscription_state',
    ) {
        parent::__construct($message);
    }
}
