<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Community Subscriptions extension (SHOULD-ship): one leader pays for many
 * seats (church funds, cooperatives, estate dues).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('merchant_id')->constrained('merchants')->restrictOnDelete();
            $table->foreignUuid('plan_id')->constrained('plans')->restrictOnDelete();
            $table->foreignUuid('leader_customer_id')->constrained('customers')->restrictOnDelete();
            $table->integer('seat_count');
            $table->string('status'); // mirrors subscription status
            $table->timestampTz('current_period_end')->nullable();
            $table->foreignUuid('card_token_id')->nullable()->constrained('card_tokens')->restrictOnDelete();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_subscriptions');
    }
};
