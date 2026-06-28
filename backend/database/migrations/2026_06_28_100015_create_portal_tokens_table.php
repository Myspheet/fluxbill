<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Single-use, time-limited customer portal links.
 * Token stored as SHA-256 hash, NEVER plaintext.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portal_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subscription_id')->constrained('subscriptions')->restrictOnDelete();
            $table->string('token'); // hash('sha256', $plain)
            $table->timestampTz('expires_at');
            $table->boolean('used')->default(false);
            $table->timestampsTz();

            $table->index('token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portal_tokens');
    }
};
