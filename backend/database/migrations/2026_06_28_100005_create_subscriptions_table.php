<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** The lifecycle object. 9-state machine — see docs/03-STATE-MACHINE.md. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('merchant_id')->constrained('merchants')->restrictOnDelete();
            $table->foreignUuid('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignUuid('plan_id')->constrained('plans')->restrictOnDelete();
            $table->enum('status', [
                'trialing',
                'active',
                'past_due',
                'grace_period',
                'access_suspended',
                'paused',
                'cancel_at_period_end',
                'cancelled',
                'expired',
            ]);
            $table->foreignUuid('card_token_id')->nullable()->constrained('card_tokens')->restrictOnDelete();
            $table->timestampTz('current_period_start')->nullable();
            $table->timestampTz('current_period_end')->nullable(); // drives the billing sweep
            $table->timestampTz('trial_ends_at')->nullable();
            $table->timestampTz('cancelled_at')->nullable();
            $table->boolean('cancel_at_period_end')->default(false);
            $table->timestampTz('pause_starts_at')->nullable();
            $table->timestampTz('pause_ends_at')->nullable();
            $table->timestampsTz();

            $table->index(['status', 'current_period_end']); // billing sweep
            $table->index('merchant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
