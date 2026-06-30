<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\MerchantController;
use App\Http\Controllers\Api\PlanController;
use Illuminate\Support\Facades\Route;


// System
Route::get('/health', HealthController::class)->name('health');

// Public auth
Route::post('/merchants/register', [AuthController::class, 'register'])->name('merchants.register');
Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.login');

// Public storefront
Route::get('/merchants/{id}/storefront', [\App\Http\Controllers\Api\StorefrontController::class, 'show'])->name('merchants.storefront');
Route::get('/plans/{id}/public', [\App\Http\Controllers\Api\PlanController::class, 'showPublic'])->name('plans.show.public');

// Public checkout
Route::post('/subscriptions/checkout', [\App\Http\Controllers\Api\CheckoutController::class, 'checkout'])->name('subscriptions.checkout');
Route::get('/subscriptions/checkout/{ref}/status', [\App\Http\Controllers\Api\CheckoutController::class, 'status'])->name('subscriptions.checkout.status');

// Nomba Webhook receiver
Route::post('/webhooks/nomba', [\App\Http\Controllers\Api\WebhookController::class, 'handle'])->name('webhooks.nomba');

// Public customer portal routes
Route::get('/portal/{token}/subscription', [\App\Http\Controllers\Api\PortalController::class, 'show'])->name('portal.show');
Route::post('/portal/cancel', [\App\Http\Controllers\Api\PortalController::class, 'cancel'])->name('portal.cancel');
Route::post('/portal/update-card', [\App\Http\Controllers\Api\PortalController::class, 'updateCard'])->name('portal.update_card');
Route::post('/portal/change-plan', [\App\Http\Controllers\Api\PortalController::class, 'changePlan'])->name('portal.change_plan');

// Merchant-authenticated (Sanctum). Tenant isolation is enforced by the global
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

    // Customers & subscriptions
    Route::get('/customers', [\App\Http\Controllers\Api\CustomerController::class, 'index'])->name('customers.index');
    Route::post('/subscriptions/{id}/change-plan', [\App\Http\Controllers\Api\SubscriptionController::class, 'changePlan'])->name('subscriptions.change_plan');
    Route::post('/subscriptions/{id}/cancel', [\App\Http\Controllers\Api\SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
    Route::post('/portal/generate', [\App\Http\Controllers\Api\PortalController::class, 'generate'])->name('portal.generate');
});

// Admin-only (Sanctum + is_admin). Platform-wide visibility across all merchants.
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/merchants', [\App\Http\Controllers\Api\AdminController::class, 'merchants'])->name('admin.merchants');
    Route::get('/merchants/{id}', [\App\Http\Controllers\Api\AdminController::class, 'merchant'])->name('admin.merchants.show');
    Route::get('/summary', [\App\Http\Controllers\Api\AdminController::class, 'summary'])->name('admin.summary');
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
