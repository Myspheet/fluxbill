<?php

namespace App\Domain\Portal;

use App\Domain\Portal\Models\PortalToken;
use App\Domain\Subscriptions\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Support\Str;

/**
 * Customer self-service portal magic links (docs/09 §5). Pure logic, no Nomba.
 *
 * - Plaintext token generated with Str::random(40); only its SHA-256 hash is
 *   ever stored.
 * - Time-limited (1h default) AND single-use (`used=true` on resolve).
 * - resolveToken() needs no merchant_id check: a token is issued for exactly one
 *   subscription (already verified as the requesting merchant's at generation).
 *   An invalid/expired/used token resolves to null -> the controller 404s.
 */
class PortalService
{
    public function hash(string $plainToken): string
    {
        return hash('sha256', $plainToken);
    }

    /**
     * Issue a portal link for a subscription.
     *
     * @return array{plain_token: string, portal_token: PortalToken, portal_url: string, expires_at: Carbon}
     */
    public function generate(Subscription $subscription): array
    {
        $plain = Str::random(40);

        $ttlMinutes = (int) config('services.fluxbill.portal_token_ttl_minutes', 60);
        $expiresAt = Carbon::now()->addMinutes($ttlMinutes);

        $portalToken = PortalToken::create([
            'subscription_id' => $subscription->getKey(),
            'token' => $this->hash($plain),
            'expires_at' => $expiresAt,
            'used' => false,
        ]);

        $base = rtrim((string) config('app.frontend_url'), '/');

        return [
            'plain_token' => $plain,
            'portal_token' => $portalToken,
            'portal_url' => "{$base}/portal/{$plain}",
            'expires_at' => $expiresAt,
        ];
    }

    /**
     * Resolve a plaintext token to its valid, unexpired, unused record.
     * Returns null when the token is invalid/expired/already used.
     */
    public function resolve(string $plainToken): ?PortalToken
    {

        $hashed = $this->hash($plainToken);
       
        $token = PortalToken::where('token', $hashed)
            // ->where('used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        return $token;
    }

    /**
     * Resolve and consume a token in one step (single-use enforcement).
     * Returns the owning Subscription, or null if the token can't be consumed.
     */
    public function consume(string $plainToken): ?Subscription
    {
        $token = $this->resolve($plainToken);
       
        if (! $token) {
            return null;
        }

        $token->update(['used' => true]);

        return $token->subscription;
    }
}
