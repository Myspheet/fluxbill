<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The central ledger record. Exists before any Nomba call; every webhook
 * reconciles back to it via merchant_tx_ref.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('merchant_id')->constrained('merchants')->restrictOnDelete();
            // null until the first payment confirms and the subscription is born.
            $table->foreignUuid('subscription_id')->nullable()->constrained('subscriptions')->restrictOnDelete();
            $table->foreignUuid('customer_id')->constrained('customers')->restrictOnDelete();
            // set at creation — the only place the plan is known before a subscription exists.
            $table->foreignUuid('plan_id')->constrained('plans')->restrictOnDelete();
            $table->bigInteger('amount'); // kobo
            $table->enum('status', [
                'draft',
                'open',
                'paid',
                'past_due',
                'failed',
                'recovered',
                'partially_paid',
                'void',
            ]);
            $table->string('merchant_tx_ref')->unique(); // base ref (inv_{id}) — what you send Nomba
            $table->string('last_attempt_tx_ref')->nullable();
            $table->integer('attempt_count')->default(0);
            $table->timestampTz('next_attempt_at')->nullable(); // set by DunningRouter
            $table->string('decline_reason')->nullable(); // drives the router (confirm values vs Nomba Day 1)
            $table->string('virtual_account_ref')->nullable(); // only for bank-transfer invoices
            $table->bigInteger('amount_received')->nullable(); // partial payments
            $table->bigInteger('amount_remaining')->nullable(); // partial payments
            $table->timestampTz('paid_at')->nullable();
            $table->timestampTz('recovered_at')->nullable(); // set when paid after >=1 prior failure
            $table->timestampsTz();

            $table->index('virtual_account_ref');
            $table->index('next_attempt_at');
            $table->index('merchant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
