<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\MerchantController;
use App\Http\Controllers\Api\PlanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| FluxBill API — PRE-WINDOW (no Nomba)
|--------------------------------------------------------------------------
| Only pure-DB / pure-logic endpoints exist before 1 July. In-window routes
| (checkout, webhook receiver, subscriptions, dashboard, customer portal) are
| listed at the bottom as a build manifest and wired during Days 1-6.
*/

// System
Route::get('/health', HealthController::class)->name('health');

// Public auth
Route::post('/merchants/register', [AuthController::class, 'register'])->name('merchants.register');
Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.login');

// Merchant-authenticated (Sanctum). Tenant isolation is enforced by the global
// MerchantScope on the scoped models, not by per-route where() clauses.
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me'])->name('auth.me');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

    Route::patch('/merchants/webhook', [MerchantController::class, 'updateWebhook'])->name('merchants.webhook.update');

    // Plan CRUD (DELETE archives via status, never hard-deletes).
    Route::get('/plans', [PlanController::class, 'index'])->name('plans.index');
    Route::post('/plans', [PlanController::class, 'store'])->name('plans.store');
    Route::get('/plans/{id}', [PlanController::class, 'show'])->name('plans.show');
    Route::patch('/plans/{id}', [PlanController::class, 'update'])->name('plans.update');
    Route::delete('/plans/{id}', [PlanController::class, 'destroy'])->name('plans.destroy');
});

/*
|--------------------------------------------------------------------------
| IN-WINDOW routes (DO NOT add before 1 July) — build manifest only
|--------------------------------------------------------------------------
| Day 2  POST   /subscriptions/checkout                 (Nomba checkout)
| Day 2  GET    /subscriptions/checkout/{ref}/status    (return-page polling)
| Day 3  POST   /webhooks/nomba                          (HMAC + idempotency)
| Day 4  POST   /subscriptions/{id}/change-plan          (proration)
| Day 4  POST   /subscriptions/{id}/cancel
| Day 4  GET    /subscriptions, /subscriptions/{id}/invoices
| Day 5  GET    /dashboard/summary|churn-risk|recovered-revenue|business-model-projection
| Day 6  POST   /portal/generate  +  GET/POST /portal/{token}/...
*/
