<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** AI churn score per subscription per cycle. See docs/07-AI-MODULE.md. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('churn_scores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subscription_id')->constrained('subscriptions')->restrictOnDelete();
            $table->enum('risk', ['low', 'medium', 'high']);
            $table->integer('score'); // 0-100
            $table->string('reason'); // one sentence from Gemini
            $table->jsonb('signals_snapshot'); // inputs used (auditability)
            $table->timestampTz('calculated_at');
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('churn_scores');
    }
};
