<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    /**
     * Health check
     *
     * Liveness probe with a database connectivity check. Returns 200 when healthy,
     * 503 when the database is unreachable.
     */
    public function __invoke(): JsonResponse
    {
        $database = 'ok';
        $ok = true;

        try {
            DB::connection()->getPdo();
        } catch (Throwable $e) {
            $database = 'unavailable';
            $ok = false;
        }

        return response()->json([
            'status' => $ok ? 'ok' : 'degraded',
            'service' => 'fluxbill-api',
            'checks' => [
                'database' => $database,
            ],
            'time' => now()->toIso8601String(),
        ], $ok ? 200 : 503);
    }
}
