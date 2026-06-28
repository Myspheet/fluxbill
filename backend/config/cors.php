<?php

/*
|--------------------------------------------------------------------------
| Cross-Origin Resource Sharing (CORS) — docs/10
|--------------------------------------------------------------------------
| The React frontend (Vite) is a separate codebase calling this API, so CORS
| is configured from day one. allowed_origins is driven by FRONTEND_URL so the
| same config works locally and in production.
*/

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['X-Request-Id'],

    'max_age' => 0,

    'supports_credentials' => true,

];
