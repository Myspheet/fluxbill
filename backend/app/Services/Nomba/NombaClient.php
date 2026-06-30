<?php
namespace App\Services\Nomba;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\Nomba\NombaAuthService;
use Illuminate\Support\Str;

/**
 * The single, reusable client for every Nomba API call in FluxBill.
 * 
 */
class NombaClient
{
    public function __construct(protected NombaAuthService $auth)
    {
    }

    /**
     * POST to a Nomba endpoint. $path should start with a leading
     * slash, e.g. '/checkout/order', '/tokenized-card/charge'.
     *
     * Automatically retries ONCE on a 401, after forcing a fresh
     * token — covers the case where a cached token expired between
     * being read from cache and the request actually reaching Nomba.
     */
    public function post(string $path, array $payload = []): array
    {
        return $this->request('post', $path, $payload);
    }

    public function get(string $path, array $query = []): array
    {
        return $this->request('get', $path, $query);
    }

    protected function request(string $method, string $path, array $data): array
    {
        $requestId = (string) Str::uuid(); // for correlating our own
                                             // logs with Nomba support
                                             // if something needs
                                             // investigating later

        $response = $this->send($method, $path, $data);

        if ($response->status() === 401) {
            Log::warning('Nomba request got 401, refreshing token and retrying once', [
                'path'       => $path,
                'request_id' => $requestId,
            ]);

            $this->auth->refreshAccessToken();
            $response = $this->send($method, $path, $data);
        }

        Log::info('Nomba API call', [
            'method'      => $method,
            'path'        => $path,
            'status'      => $response->status(),
            'request_id'  => $requestId,
        ]);

        if ($response->failed()) {
            Log::error('Nomba API call failed', [
                'method'     => $method,
                'path'       => $path,
                'status'     => $response->status(),
                'body'       => $response->body(),
                'request_id' => $requestId,
            ]);
        }

        // return the raw decoded body regardless of success/failure —
        // callers are expected to check $response['status'] /
        // $response['code'] themselves per-endpoint, since Nomba's
        // error shape varies slightly by product. We do NOT throw
        // here, because a failed CHARGE (e.g. card declined) is a
        // normal, expected outcome the dunning router needs to see,
        // not an exception to catch.
        return $response->json() ?? [];
    }

    protected function send(string $method, string $path, array $data): Response
    {
        $request = Http::withToken($this->auth->getAccessToken())
            ->withHeaders([
                'accountId' => config('services.nomba.account_id'),
            ])
            ->timeout(15);

        $url = config('services.nomba.base_url') . $path;

        return $method === 'get'
            ? $request->get($url, $data)
            : $request->post($url, $data);
    }
}