<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Nomba (payments) — IN-WINDOW
    |--------------------------------------------------------------------------
    | These are read here so config is ready, but NO code may call api.nomba.com
    | until 1 July. All keys are blank pre-window; a line only "uses" Nomba once
    | it makes a request with these credentials.
    */
    'nomba' => [
          'env' => env('NOMBA_ENV', 'sandbox'),
        'base_url' => env('NOMBA_BASE_URL', 'https://api.nomba.com/v1'),
        'client_id' => env('NOMBA_CLIENT_ID'),
        'client_secret' => env('NOMBA_CLIENT_SECRET'),
        'account_id' => env('NOMBA_ACCOUNT_ID'),
        'webhook_secret' => env('NOMBA_WEBHOOK_SECRET'),
        'primary_account_number' => env('NOMBA_PRIMARY_ACCOUNT_NUMBER'),
        'primary_bank_code' => env('NOMBA_PRIMARY_BANK_CODE'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Google Gemini (AI) — IN-WINDOW
    |--------------------------------------------------------------------------
    */
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-1.5-flash'),
    ],

    /*
    |--------------------------------------------------------------------------
    | FluxBill platform settings (pre-window safe)
    |--------------------------------------------------------------------------
    */
    'fluxbill' => [
        // Underpayment tolerance for virtual-account invoices, in kobo.
        'partial_payment_tolerance' => (int) env('FLUXBILL_PARTIAL_PAYMENT_TOLERANCE', 5000),
        // Customer-portal magic-link lifetime, in minutes.
        'portal_token_ttl_minutes' => (int) env('FLUXBILL_PORTAL_TOKEN_TTL_MINUTES', 60),
    ],

];
