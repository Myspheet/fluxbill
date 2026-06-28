<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tokenized cards returned by Nomba after hosted checkout. NO PAN ever stored.
 * nomba_card_id is populated in-window; rows only exist after a real checkout.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('card_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('customer_id')->constrained('customers')->restrictOnDelete();
            $table->string('nomba_card_id'); // cardId from checkout success (in-window)
            $table->string('last_four', 4)->nullable();
            $table->string('card_brand')->nullable();
            $table->enum('status', ['active', 'revoked'])->default('active');
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_tokens');
    }
};
