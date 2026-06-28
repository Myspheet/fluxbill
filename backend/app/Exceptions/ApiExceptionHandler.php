<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

/**
 * The ONE place every API error is shaped (docs/06 §3). A downstream developer
 * writes a single error handler against:
 *
 *   { "error": { "code", "message", "field", "request_id" } }
 *
 * Cross-merchant access surfaces here as a 404 (the tenant scope simply returns
 * no rows, so findOrFail throws ModelNotFoundException) — existence is never
 * leaked via 403.
 */
class ApiExceptionHandler
{
    public static function render(Throwable $e, Request $request): JsonResponse
    {
        [$status, $code, $message, $field] = self::classify($e, $request);

        return response()->json([
            'error' => [
                'code' => $code,
                'message' => $message,
                'field' => $field,
                'request_id' => $request->attributes->get('request_id'),
            ],
        ], $status);
    }

    /**
     * @return array{0:int,1:string,2:string,3:?string} [status, code, message, field]
     */
    protected static function classify(Throwable $e, Request $request): array
    {
        return match (true) {
            $e instanceof ValidationException => [
                422,
                'validation_failed',
                $e->validator->errors()->first(),
                array_key_first($e->errors()),
            ],

            $e instanceof AuthenticationException => [
                401,
                'unauthenticated',
                'Authentication is required to access this resource.',
                null,
            ],

            $e instanceof AuthorizationException => [
                403,
                'forbidden',
                'You are not allowed to perform this action.',
                null,
            ],

            // Both "genuinely missing" and "belongs to another merchant" land here as 404.
            $e instanceof ModelNotFoundException,
            $e instanceof NotFoundHttpException => [
                404,
                'not_found',
                'The requested resource was not found.',
                null,
            ],

            $e instanceof InvalidSubscriptionStateException => [
                400,
                $e->errorCode,
                $e->getMessage(),
                null,
            ],

            $e instanceof HttpExceptionInterface => [
                $e->getStatusCode(),
                self::codeForStatus($e->getStatusCode()),
                $e->getMessage() ?: self::messageForStatus($e->getStatusCode()),
                null,
            ],

            default => [
                500,
                'server_error',
                config('app.debug') ? $e->getMessage() : 'An unexpected error occurred.',
                null,
            ],
        };
    }

    protected static function codeForStatus(int $status): string
    {
        return match ($status) {
            400 => 'bad_request',
            401 => 'unauthenticated',
            403 => 'forbidden',
            404 => 'not_found',
            405 => 'method_not_allowed',
            409 => 'conflict',
            422 => 'validation_failed',
            429 => 'too_many_requests',
            default => 'http_error',
        };
    }

    protected static function messageForStatus(int $status): string
    {
        return match ($status) {
            400 => 'The request was invalid.',
            401 => 'Authentication is required to access this resource.',
            403 => 'You are not allowed to perform this action.',
            404 => 'The requested resource was not found.',
            405 => 'The HTTP method is not allowed for this endpoint.',
            409 => 'The request conflicts with the current state.',
            429 => 'Too many requests.',
            default => 'An error occurred.',
        };
    }
}
