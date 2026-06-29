<?php

namespace App\Http\Middleware;

use App\Domain\Merchants\Models\Merchant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Reject non-admin merchants with a 403.
 * Applied to the admin/* route group.
 */
class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof Merchant || ! $user->is_admin) {
            return response()->json([
                'error' => [
                    'code' => 'forbidden',
                    'message' => 'Admin access required.',
                    'request_id' => $request->header('X-Request-Id'),
                ],
            ], 403);
        }

        return $next($request);
    }
}
