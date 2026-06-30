<?php

namespace App\Services\Nomba;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Handles Nomba OAuth2 authentication and token caching.
 *
 * Nomba access tokens are valid for 60 minutes. We cache and refresh
 * at the 55-minute mark — never request a fresh token per call, even
 * across many concurrent background jobs. Share the cached token.
 */
class NombaAuthService
{
    protected const CACHE_KEY = 'nomba_access_token';
    protected const TOKEN_TTL_MINUTES = 55; // refresh before the real
                                              // 60-minute expiry, never at it

    public function getAccessToken(): string
    {
        return Cache::remember(self::CACHE_KEY, now()->addMinutes(self::TOKEN_TTL_MINUTES), function () {
            return $this->issueToken();
        });
    }

    /**
     * Forces a fresh token, bypassing the cache. 
     */
    public function refreshAccessToken(): string
    {
        Cache::forget(self::CACHE_KEY);

        return $this->getAccessToken();
    }

    protected function issueToken(): string
    {
        $response = Http::asJson()
            ->withHeaders([
                'accountId' => config('services.nomba.account_id'),
            ])
            ->post(config('services.nomba.base_url') . '/auth/token/issue', [
                'grant_type'    => 'client_credentials',
                'client_id'     => config('services.nomba.client_id'),
                'client_secret' => config('services.nomba.client_secret'),
            ]);

        if ($response->failed()) {
            Log::error('Nomba token issuance failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            throw new \RuntimeException(
                'Could not authenticate with Nomba: ' . $response->status()
            );
        }

        $token = $response->json('data.access_token') ?? $response->json('access_token');

        if (!$token) {
            Log::error('Nomba token response missing access_token', [
                'body' => $response->body(),
            ]);

            throw new \RuntimeException('Nomba auth response did not contain an access_token');
        }

        return $token;
    }
}