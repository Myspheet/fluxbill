<?php

use App\Exceptions\ApiExceptionHandler;
use App\Http\Middleware\AssignRequestId;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Every API request gets a correlatable request id (echoed in errors + header).
        $middleware->api(prepend: [
            AssignRequestId::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Standardised JSON error shape for the API (docs/06 §3) — one place only.
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiExceptionHandler::render($e, $request);
            }

            return null;
        });
    })->create();
