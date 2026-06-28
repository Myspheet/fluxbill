<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Downgrade credit, applied to the next invoice (not refunded immediately). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_change_credits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subscription_id')->constrained('subscriptions')->restrictOnDelete();
            $table->bigInteger('credit_amount'); // kobo, owed to customer
            $table->boolean('applied')->default(false);
            $table->foreignUuid('applied_to_invoice_id')->nullable()->constrained('invoices')->restrictOnDelete();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_change_credits');
    }
};
