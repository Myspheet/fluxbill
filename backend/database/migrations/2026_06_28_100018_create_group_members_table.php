<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** A seat within a group_subscription. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('group_subscription_id')->constrained('group_subscriptions')->restrictOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('status');
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_members');
    }
};
