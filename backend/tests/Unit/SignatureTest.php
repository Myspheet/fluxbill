<?php

namespace Tests\Unit;

use App\Support\Signature;
use PHPUnit\Framework\TestCase;

class SignatureTest extends TestCase
{
    public function test_sign_is_deterministic_hmac_sha256(): void
    {
        $payload = '{"event":"payment_success"}';
        $secret = 'whsec_test';

        $expected = hash_hmac('sha256', $payload, $secret);
        $this->assertSame($expected, Signature::sign($payload, $secret));
    }

    public function test_verify_accepts_a_correct_signature(): void
    {
        $payload = '{"amount":500000}';
        $secret = 'whsec_test';
        $sig = Signature::sign($payload, $secret);

        $this->assertTrue(Signature::verify($payload, $secret, $sig));
    }

    public function test_verify_rejects_a_tampered_payload_or_secret(): void
    {
        $payload = '{"amount":500000}';
        $secret = 'whsec_test';
        $sig = Signature::sign($payload, $secret);

        $this->assertFalse(Signature::verify('{"amount":999999}', $secret, $sig));
        $this->assertFalse(Signature::verify($payload, 'wrong_secret', $sig));
        $this->assertFalse(Signature::verify($payload, $secret, 'deadbeef'));
    }
}
