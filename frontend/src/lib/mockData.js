// Mock data for screens whose live data depends on IN-WINDOW Nomba features
// (dashboard metrics, churn copilot, subscribe/return/portal). Swapped for real
// API responses during the 1-7 July build window. Amounts in kobo.

export const mockDashboardSummary = {
  recovered_revenue_kobo: 24050000, // the hero number (₦240,500)
  mrr_kobo: 184500000,
  active_subscriptions: 312,
  past_due: 18,
  recovery_rate_pct: 71,
}

export const mockChurnRisks = [
  {
    subscription_id: 'sub_a1b2c3',
    customer: 'Emeka Obi',
    plan: 'Premium Monthly',
    risk: 'high',
    score: 88,
    reason: '3 failed charges in 90 days and a recent downgrade.',
    recommendation: 'Offer a 10% retention discount before next renewal.',
    expected_recovery_kobo: 5400000,
    at_risk_kobo: 24000000,
  },
  {
    subscription_id: 'sub_d4e5f6',
    customer: 'Ada Nwosu',
    plan: 'Growth Monthly',
    risk: 'medium',
    score: 54,
    reason: 'One failed charge recovered last cycle; card nearing expiry.',
    recommendation: 'Send a card-update reminder via the portal link.',
    expected_recovery_kobo: 1500000,
    at_risk_kobo: 5000000,
  },
  {
    subscription_id: 'sub_g7h8i9',
    customer: 'Tunde Bello',
    plan: 'Starter Monthly',
    risk: 'low',
    score: 21,
    reason: 'Consistent on-time payments for 8 cycles.',
    recommendation: 'No action needed.',
    expected_recovery_kobo: 0,
    at_risk_kobo: 0,
  },
]

export const mockBusinessModelProjection = {
  model: 'percentage',
  fee_rate_label: '1.5%',
  monthly_volume_kobo: 184500000,
  projected_monthly_fee_kobo: 2767500,
  projected_annual_fee_kobo: 33210000,
}

// Public subscribe page sample (would come from GET plan by id).
export const mockPlan = {
  id: 'plan_growth_monthly',
  name: 'Growth Monthly',
  amount: 500000,
  currency: 'NGN',
  interval: 'monthly',
  trial_days: 7,
  merchant_name: 'Adaeze Gym',
}

// Customer portal sample (would come from GET /portal/{token}/subscription|invoices).
export const mockPortalSubscription = {
  customer: 'Emeka Obi',
  plan: 'Growth Monthly',
  status: 'past_due',
  amount: 500000,
  next_billing_date: '2026-07-12',
  card_last_four: '4242',
}

export const mockPortalInvoices = [
  { id: 'inv_8821', amount: 500000, status: 'recovered', date: '2026-06-12' },
  { id: 'inv_8709', amount: 500000, status: 'paid', date: '2026-05-12' },
  { id: 'inv_8642', amount: 500000, status: 'partially_paid', date: '2026-04-12' },
]
