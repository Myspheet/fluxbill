<?php

use App\Domain\Subscriptions\Models\Subscription;
use App\Domain\Subscriptions\Enums\SubscriptionStatus;
use App\Domain\Billing\Models\Invoice;
use App\Domain\Billing\Models\DunningAttempt;
use App\Domain\Billing\DunningRouter;
use App\Domain\Billing\Enums\InvoiceStatus;
use App\Domain\Plans\Models\Plan;
use App\Domain\AI\Models\ChurnScore;
use App\Domain\AI\Models\RecoveryRecommendation;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

Artisan::command('fluxbill:sweep', function () {
    $this->info("Running FluxBill Daily Billing Sweep...");

    $router = new DunningRouter();
    $today = Carbon::today();

    // 1. Process active subscriptions due for renewal (current_period_end <= today)
    $dueSubscriptions = Subscription::withoutGlobalScopes()
        ->whereIn('status', [SubscriptionStatus::Active->value, SubscriptionStatus::Trialing->value])
        ->where('current_period_end', '<=', $today)
        ->get();

    $this->info("Found " . $dueSubscriptions->count() . " subscriptions due for renewal.");

    foreach ($dueSubscriptions as $sub) {
        $plan = Plan::withoutGlobalScopes()->find($sub->plan_id);
        if (!$plan) continue;

        // Create new open invoice
        $txRef = 'inv_' . Str::random(8) . '_attempt_1';
        $invoice = Invoice::create([
            'merchant_id' => $sub->merchant_id,
            'subscription_id' => $sub->id,
            'customer_id' => $sub->customer_id,
            'plan_id' => $sub->plan_id,
            'amount' => $plan->amount,
            'status' => InvoiceStatus::Open,
            'merchant_tx_ref' => $txRef,
            'attempt_count' => 1,
        ]);

        // Simulate Charge (mocking Nomba tokenized charge)
        $success = rand(1, 100) <= 75;

        if ($success) {
            $invoice->update([
                'status' => InvoiceStatus::Paid,
                'paid_at' => Carbon::now(),
            ]);

            $sub->update([
                'status' => SubscriptionStatus::Active,
                'current_period_start' => Carbon::now(),
                'current_period_end' => $plan->interval === 'monthly' ? Carbon::now()->addMonth() : Carbon::now()->addYear(),
            ]);

            $this->info("Subscription {$sub->id} renewed successfully. Invoice marked PAID.");
        } else {
            // Failure! Smart Retry Engine takes over
            $reasons = [
                DunningRouter::REASON_INSUFFICIENT_FUNDS,
                DunningRouter::REASON_CARD_EXPIRED,
                DunningRouter::REASON_BANK_UNAVAILABLE,
                DunningRouter::REASON_DO_NOT_HONOR
            ];
            $declineReason = $reasons[array_rand($reasons)];
            $attemptNumber = 1;

            $invoice->update([
                'status' => InvoiceStatus::Failed,
                'decline_reason' => $declineReason,
                'last_attempt_tx_ref' => $txRef,
            ]);

            DunningAttempt::create([
                'invoice_id' => $invoice->id,
                'subscription_id' => $sub->id,
                'attempt_number' => $attemptNumber,
                'merchant_tx_ref' => $txRef,
                'status' => 'failed',
                'failure_reason' => $declineReason,
                'attempted_at' => Carbon::now(),
            ]);

            // Dunning router transitions
            $next = $router->nextAction($declineReason, $attemptNumber);

            if (!$next['retry']) {
                $sub->update(['status' => SubscriptionStatus::AccessSuspended]);
                $this->warn("Subscription {$sub->id} failed due to {$declineReason}. Access suspended.");
            } else {
                $sub->update(['status' => SubscriptionStatus::PastDue]);
                $invoice->update([
                    'status' => InvoiceStatus::Open,
                    'next_attempt_at' => $next['next_attempt_at'],
                ]);
                $this->warn("Subscription {$sub->id} failed due to {$declineReason}. Retry scheduled at " . $next['next_attempt_at']);
            }
        }
    }

    // 2. Process open invoices that are scheduled for retry (status = open and next_attempt_at <= now)
    $retryInvoices = Invoice::withoutGlobalScopes()
        ->where('status', InvoiceStatus::Open)
        ->whereNotNull('next_attempt_at')
        ->where('next_attempt_at', '<=', Carbon::now())
        ->get();

    $this->info("Found " . $retryInvoices->count() . " invoices due for smart retry.");

    foreach ($retryInvoices as $inv) {
        $sub = Subscription::withoutGlobalScopes()->find($inv->subscription_id);
        if (!$sub) continue;

        $attemptNumber = $inv->attempt_count + 1;
        $txRef = 'inv_' . Str::random(8) . '_attempt_' . $attemptNumber;

        // Try charge again.
        $success = rand(1, 100) <= 50;

        if ($success) {
            $inv->update([
                'status' => InvoiceStatus::Recovered,
                'recovered_at' => Carbon::now(),
                'paid_at' => Carbon::now(),
                'next_attempt_at' => null,
            ]);

            $plan = Plan::withoutGlobalScopes()->find($inv->plan_id);
            $sub->update([
                'status' => SubscriptionStatus::Active,
                'current_period_start' => Carbon::now(),
                'current_period_end' => $plan->interval === 'monthly' ? Carbon::now()->addMonth() : Carbon::now()->addYear(),
            ]);

            DunningAttempt::create([
                'invoice_id' => $inv->id,
                'subscription_id' => $sub->id,
                'attempt_number' => $attemptNumber,
                'merchant_tx_ref' => $txRef,
                'status' => 'succeeded',
                'attempted_at' => Carbon::now(),
            ]);

            $this->info("Invoice {$inv->id} successfully RECOVERED on attempt {$attemptNumber}!");
        } else {
            // Keep failing
            $declineReason = $inv->decline_reason ?: DunningRouter::REASON_INSUFFICIENT_FUNDS;

            DunningAttempt::create([
                'invoice_id' => $inv->id,
                'subscription_id' => $sub->id,
                'attempt_number' => $attemptNumber,
                'merchant_tx_ref' => $txRef,
                'status' => 'failed',
                'failure_reason' => $declineReason,
                'attempted_at' => Carbon::now(),
            ]);

            $next = $router->nextAction($declineReason, $attemptNumber);

            $inv->update([
                'attempt_count' => $attemptNumber,
                'last_attempt_tx_ref' => $txRef,
            ]);

            if (!$next['retry']) {
                $inv->update([
                    'status' => InvoiceStatus::Failed,
                    'next_attempt_at' => null,
                ]);

                $sub->update(['status' => SubscriptionStatus::Cancelled]);
                $this->warn("Subscription {$sub->id} failed all retries. Subscription CANCELLED.");
            } else {
                if ($sub->status === SubscriptionStatus::PastDue && $attemptNumber >= 2) {
                    $sub->update(['status' => SubscriptionStatus::GracePeriod]);
                }

                $inv->update([
                    'next_attempt_at' => $next['next_attempt_at'],
                ]);
                $this->warn("Invoice {$inv->id} retry {$attemptNumber} failed. Next retry scheduled at " . $next['next_attempt_at']);
            }
        }
    }
})->purpose('Run daily billing renewals and smart retry logic');

Artisan::command('fluxbill:churn-risk', function () {
    $this->info("Running AI Churn Risk scoring analysis...");

    $apiKey = env('GEMINI_API_KEY');
    $activeSubs = Subscription::withoutGlobalScopes()->whereNotIn('status', [SubscriptionStatus::Cancelled->value, SubscriptionStatus::Expired->value])->get();

    $this->info("Analyzing " . $activeSubs->count() . " active subscriptions.");

    foreach ($activeSubs as $sub) {
        // Collect health signals
        $invoices = Invoice::withoutGlobalScopes()->where('subscription_id', $sub->id)->get();
        $totalInvoices = $invoices->count();
        $failedInvoices = $invoices->where('status', InvoiceStatus::Failed)->count();
        $recoveredInvoices = $invoices->where('status', InvoiceStatus::Recovered)->count();
        
        $signals = [
            'subscription_age_days' => $sub->created_at->diffInDays(Carbon::now()),
            'status' => $sub->status->value,
            'total_invoices' => $totalInvoices,
            'failed_invoices' => $failedInvoices,
            'recovered_invoices' => $recoveredInvoices,
            'decline_reasons' => $invoices->pluck('decline_reason')->filter()->values()->toArray(),
        ];

        $risk = 'low';
        $score = rand(5, 25);
        $reason = 'Good payment history and active tokenized card.';
        $recText = 'No action needed. Healthy subscription status.';
        $expectedAmount = 0;
        $expectedPct = 95;

        // Smart simulated fallback / Gemini helper
        if ($failedInvoices > 0 || $sub->status->value === 'past_due' || $sub->status->value === 'grace_period') {
            $risk = 'medium';
            $score = rand(45, 65);
            $reason = 'Encountered billing failures but retries are still scheduled.';
            $recText = 'Trigger win-back email and apply automatic 15% discount for 2 cycles.';
            $expectedAmount = (int) ($sub->plan?->amount * 0.85);
            $expectedPct = 70;
        }

        if ($sub->status->value === 'access_suspended') {
            $risk = 'high';
            $score = rand(80, 95);
            $reason = 'Access suspended due to card decline or expiration.';
            $recText = 'Send passwordless magic link to customer portal to update payment card.';
            $expectedAmount = (int) ($sub->plan?->amount ?: 0);
            $expectedPct = 40;
        }

        if ($apiKey) {
            $prompt = "Analyze subscription churn risk based on these health signals: " . json_encode($signals) . ". Reply with a clean JSON format only matching fields: 'risk' ('low', 'medium', 'high'), 'score' (integer 0-100), 'reason' (one sentence), 'recommendation' (one sentence), 'expected_recovery_pct' (integer 0-100).";
            
            try {
                $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]]
                    ]
                ]);

                if ($response->successful()) {
                    $json = $response->json();
                    $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
                    // Simple parse if text contains JSON
                    if (preg_match('/\{.*\}/s', $text, $matches)) {
                        $parsed = json_decode($matches[0], true);
                        if ($parsed) {
                            $risk = $parsed['risk'] ?? $risk;
                            $score = (int) ($parsed['score'] ?? $score);
                            $reason = $parsed['reason'] ?? $reason;
                            $recText = $parsed['recommendation'] ?? $recText;
                            $expectedPct = (int) ($parsed['expected_recovery_pct'] ?? $expectedPct);
                            $expectedAmount = (int) (($sub->plan?->amount ?: 0) * ($expectedPct / 100));
                        }
                    }
                }
            } catch (\Exception $e) {
                $this->warn("Gemini request failed: " . $e->getMessage() . ". Using rule fallback.");
            }
        }

        // Save churn score
        $churn = ChurnScore::create([
            'subscription_id' => $sub->id,
            'risk' => $risk,
            'score' => $score,
            'reason' => $reason,
            'signals_snapshot' => $signals,
            'calculated_at' => Carbon::now(),
        ]);

        // Save recommendation
        RecoveryRecommendation::create([
            'churn_score_id' => $churn->id,
            'subscription_id' => $sub->id,
            'recommendation' => $recText,
            'expected_recovery_amount' => $expectedAmount,
            'expected_recovery_pct' => $expectedPct,
            'action_taken' => 'none',
            'outcome' => 'pending',
        ]);

        $this->info("Subscription {$sub->id} scored: Risk: {$risk} ({$score}%)");
    }
})->purpose('Evaluate subscription health and calculate churn risk scores with Google Gemini');

Artisan::command('fluxbill:recon', function () {
    $this->info("Running nightly reconciliation job vs Nomba transaction lists...");

    $date = Carbon::yesterday()->toDateString();
    
    // Select invoices updated yesterday/today
    $invoices = Invoice::withoutGlobalScopes()
        ->whereDate('updated_at', '>=', Carbon::yesterday())
        ->get();

    $localCount = $invoices->count();
    $driftCount = 0;
    $driftDetails = [];

    // Simulate cross-checking against Nomba transactions
    // In rare cases (e.g. 5%), mock a drift log to showcase drift detection
    if (rand(1, 100) <= 5 && $localCount > 0) {
        $inv = $invoices->random();
        $driftCount = 1;
        $driftDetails[] = [
            'type' => 'status_drift',
            'invoice_id' => $inv->id,
            'merchant_tx_ref' => $inv->merchant_tx_ref,
            'nomba_status' => 'paid',
            'local_status' => $inv->status->value,
            'description' => "Invoice marked paid on Nomba but shows {$inv->status->value} locally."
        ];
    }

    DB::table('reconciliation_log')->insert([
        'id' => Str::uuid()->toString(),
        'date_checked' => $date,
        'nomba_transaction_count' => $localCount + ($driftCount ? -1 : 0),
        'local_transaction_count' => $localCount,
        'drift_count' => $driftCount,
        'drift_details' => json_encode($driftDetails),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->info("Reconciliation complete for {$date}. Local invoices: {$localCount}, Drifts logged: {$driftCount}");
})->purpose('Cross check transaction logs vs Nomba Transaction List API');
