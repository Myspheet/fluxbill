<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Nightly drift check vs Nomba /transactions (the job itself is in-window). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reconciliation_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('date_checked');
            $table->integer('nomba_transaction_count')->default(0);
            $table->integer('local_transaction_count')->default(0);
            $table->integer('drift_count')->default(0);
            $table->jsonb('drift_details')->nullable(); // orphans + amount drifts
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reconciliation_log');
    }
};
