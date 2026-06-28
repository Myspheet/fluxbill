<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** One row per retry attempt. Audit trail for recovery. (append-mostly, no updated_at) */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dunning_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->constrained('invoices')->restrictOnDelete();
            $table->foreignUuid('subscription_id')->constrained('subscriptions')->restrictOnDelete();
            $table->integer('attempt_number');
            $table->string('merchant_tx_ref'); // unique per attempt (inv_X_attempt_N)
            $table->enum('status', ['pending', 'succeeded', 'failed']);
            $table->string('failure_reason')->nullable();
            $table->timestampTz('attempted_at')->nullable();
            $table->timestampTz('next_attempt_at')->nullable();
            $table->timestampTz('created_at')->nullable();

            $table->index('invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dunning_attempts');
    }
};
