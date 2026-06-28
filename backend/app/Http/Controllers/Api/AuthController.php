<?php

namespace App\Http\Controllers\Api;

use App\Domain\Merchants\Actions\AuthenticateMerchant;
use App\Domain\Merchants\Actions\RegisterMerchant;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterMerchantRequest;
use App\Http\Resources\MerchantResource;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    /**
     * Register a merchant
     *
     * Creates a merchant account and returns a Sanctum API token plus a
     * `webhook_secret`. The secret is shown **once** here and never returned
     * again — store it to verify FluxBill's outbound webhooks.
     */
    public function register(RegisterMerchantRequest $request, RegisterMerchant $register): JsonResponse
    {
        $merchant = $register->handle($request->validated());

        $token = $merchant->createToken('api')->plainTextToken;

        return response()->json([
            'merchant' => new MerchantResource($merchant),
            'token' => $token,
            // Plaintext webhook_secret is shown once here, never returned again.
            'webhook_secret' => $merchant->webhook_secret,
        ], 201);
    }

    /**
     * Log in
     *
     * Exchange email + password for a Sanctum API token.
     */
    public function login(LoginRequest $request, AuthenticateMerchant $authenticate): JsonResponse
    {
        $merchant = $authenticate->handle(
            (string) $request->string('email'),
            (string) $request->string('password'),
        );

        $token = $merchant->createToken('api')->plainTextToken;

        return response()->json([
            'merchant' => new MerchantResource($merchant),
            'token' => $token,
        ]);
    }

    /**
     * Log out
     *
     * Revoke the bearer token used for the current request.
     */
    public function logout(): JsonResponse
    {
        auth()->user()?->currentAccessToken()?->delete();

        return response()->json(['status' => 'logged_out']);
    }

    /**
     * Current merchant
     *
     * Return the authenticated merchant's profile.
     */
    public function me(): MerchantResource
    {
        return new MerchantResource(auth()->user());
    }
}
