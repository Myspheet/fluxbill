<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Audit of upgrades/downgrades. Feeds the AI churn signal `plan_downgrades`. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_change_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subscription_id')->constrained('subscriptions')->restrictOnDelete();
            $table->foreignUuid('old_plan_id')->constrained('plans')->restrictOnDelete();
            $table->foreignUuid('new_plan_id')->constrained('plans')->restrictOnDelete();
            $table->enum('change_type', ['upgrade', 'downgrade']);
            $table->bigInteger('unused_credit'); // kobo
            $table->bigInteger('new_plan_charge'); // kobo
            $table->bigInteger('net_amount'); // kobo (negative = credit owed)
            $table->integer('days_remaining_at_change');
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_change_history');
    }
};
