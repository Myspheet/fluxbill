<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Records a refund owed from a virtual-account overpayment.
 * (Refund auto-transfer is a known gap — see docs/09 limitations.)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('overpayment_credits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->constrained('invoices')->restrictOnDelete();
            $table->bigInteger('amount'); // kobo overpaid
            $table->enum('status', ['pending_refund', 'refunded']);
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('overpayment_credits');
    }
};
