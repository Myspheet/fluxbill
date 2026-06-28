<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** A priced recurring offering. Pure DB (no Nomba). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('merchant_id')->constrained('merchants')->restrictOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->bigInteger('amount'); // kobo
            $table->string('currency', 3)->default('NGN');
            $table->enum('interval', ['weekly', 'monthly', 'annual', 'custom']);
            $table->integer('interval_count')->default(1);
            $table->integer('trial_days')->default(0);
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->timestampsTz();

            $table->index('merchant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
