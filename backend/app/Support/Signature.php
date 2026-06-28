<?php

namespace App\Support;

/**
 * HMAC-SHA256 signing/verification helper. Pure crypto — no network, safe to
 * build pre-window.
 *
 * Used two ways (both symmetric, docs/05 §5 and docs/06 §5):
 *  - INBOUND  (in-window): verify Nomba's `nomba-signature` over the raw body.
 *  - OUTBOUND (in-window): sign FluxBill's downstream webhooks with
 *    `fluxbill-signature`, so a merchant verifies us the same way we verify Nomba.
 */
final class Signature
{
    /** HMAC-SHA256 of the raw payload with the shared secret. */
    public static function sign(string $payload, string $secret): string
    {
        return hash_hmac('sha256', $payload, $secret);
    }

    /** Constant-time comparison of an expected signature against a provided one. */
    public static function verify(string $payload, string $secret, string $providedSignature): bool
    {
        $expected = self::sign($payload, $secret);

        return hash_equals($expected, $providedSignature);
    }
}
