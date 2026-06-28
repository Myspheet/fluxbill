<?php

namespace App\Domain\Billing;

/**
 * Partial-payment reconciliation for virtual-account (bank-transfer) invoices
 * (docs/04 §6). Bank rails accept any value, so an invoice can be under- or
 * over-paid.
 *
 * Rule: never silently mark a genuine shortfall as paid, never silently keep an
 * overpayment — both are surfaced. This pure decision is the only place over/
 * under-payment is caught; the in-window webhook handler applies the outcome.
 *
 * All amounts in kobo (integer).
 */
class PartialPaymentService
{
    /**
     * Decide how a received amount reconciles against the invoice amount.
     *
     * @return array{
     *     status: 'paid'|'partially_paid',
     *     within_tolerance: bool,
     *     overpayment_amount: int,
     *     amount_received: int,
     *     amount_remaining: int
     * }
     */
    public function reconcile(int $invoiceAmount, int $amountReceived, int $tolerance): array
    {
        $shortfall = $invoiceAmount - $amountReceived;

        // Exact or overpaid.
        if ($amountReceived >= $invoiceAmount) {
            return [
                'status' => 'paid',
                'within_tolerance' => true,
                'overpayment_amount' => max(0, $amountReceived - $invoiceAmount),
                'amount_received' => $amountReceived,
                'amount_remaining' => 0,
            ];
        }

        // Underpaid but within tolerance -> treat as paid, nothing owed back.
        if ($shortfall <= $tolerance) {
            return [
                'status' => 'paid',
                'within_tolerance' => true,
                'overpayment_amount' => 0,
                'amount_received' => $amountReceived,
                'amount_remaining' => 0,
            ];
        }

        // Genuine shortfall beyond tolerance -> partially paid, surface remainder.
        return [
            'status' => 'partially_paid',
            'within_tolerance' => false,
            'overpayment_amount' => 0,
            'amount_received' => $amountReceived,
            'amount_remaining' => $shortfall,
        ];
    }
}
