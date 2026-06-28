<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** The "copilot" action attached to a churn score. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recovery_recommendations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('churn_score_id')->constrained('churn_scores')->restrictOnDelete();
            $table->foreignUuid('subscription_id')->constrained('subscriptions')->restrictOnDelete();
            $table->string('recommendation'); // one sentence
            $table->bigInteger('expected_recovery_amount'); // kobo
            $table->integer('expected_recovery_pct'); // 0-100
            $table->enum('action_taken', ['none', 'discount_offered', 'manual_outreach', 'ignored'])->default('none');
            $table->enum('outcome', ['recovered', 'churned', 'pending'])->default('pending');
            $table->timestampTz('resolved_at')->nullable();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recovery_recommendations');
    }
};
