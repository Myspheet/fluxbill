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
    // public function __invoke(): JsonResponse
    // {
    //     $database = 'ok';
    //     $ok = true;

    //     try {
    //         DB::connection()->getPdo();
    //     } catch (Throwable $e) {
    //         $database = 'unavailable';
    //         $ok = false;
    //         \Log::error('Health check DB failure', ['error' => $e->getMessage()]);
    //     }

    //     return response()->json([
    //         'status' => $ok ? 'ok' : 'degraded',
    //         'service' => 'fluxbill-api',
    //         'checks' => [
    //             'database' => $database,
    //         ],
    //         'time' => now()->toIso8601String(),
    //     ], $ok ? 200 : 503);
    // }

    // app/Http/Controllers/Api/HealthController.php

public function __invoke(): JsonResponse
{
    $database = 'ok';
    $ok = true;
    $error = "";

    try {
        DB::connection()->getPdo();
        DB::connection()->select('SELECT 1');
    } catch (Throwable $e) {
        try {
            DB::purge('pgsql');      
            DB::reconnect('pgsql'); 
            DB::connection()->select('SELECT 1');
            $database = 'ok';
        } catch (Throwable $e2) {
            $database = 'unavailable';
            $ok = false;
            $error = $e2->getMessage();
            \Log::error('Health check DB failure', ['error' => $e2->getMessage()]);
        }
    }
    return response()->json([
        'status' => $ok ? 'ok' : 'degraded',
        'service' => 'fluxbill-api',
        'error' => $error ?? " no error",
        'checks' => ['database' => $database],
        'time' => now()->toIso8601String(),
    ], $ok ? 200 : 503);
}
}
