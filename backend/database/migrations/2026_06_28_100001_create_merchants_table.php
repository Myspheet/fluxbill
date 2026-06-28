<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The business using FluxBill. One Nomba sub-account each.
 * nomba_* columns are nullable and stay empty until the first real Nomba
 * call on/after 1 July (in-window).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('merchants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password_hash');

            // Populated only by an in-window Nomba sub-account call.
            $table->string('nomba_sub_account_id')->nullable();
            $table->string('nomba_sub_account_ref')->nullable();

            $table->string('webhook_url')->nullable();
            $table->string('webhook_secret'); // for signing outbound webhooks; shown once at register

            // Simulated business-model dashboard.
            $table->enum('fee_billing_model', ['percentage', 'flat'])->default('percentage');
            $table->bigInteger('fee_rate')->default(0); // percent (150 = 1.5%) or flat kobo, per model

            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('merchants');
    }
};
