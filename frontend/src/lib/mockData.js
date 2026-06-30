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

export const mockCustomers = [
  { id: 'cust_001', name: 'Emeka Obi', email: 'emeka@example.com', phone: '+234 802 345 6789', plan: 'Premium Monthly', status: 'active', card_last_four: '4242', total_paid: 3000000, created_at: '2026-02-15', invoices: [
    { id: 'inv_101', amount: 500000, status: 'paid', date: '2026-06-15' },
    { id: 'inv_092', amount: 500000, status: 'paid', date: '2026-05-15' },
    { id: 'inv_083', amount: 500000, status: 'recovered', date: '2026-04-15' },
  ] },
  { id: 'cust_002', name: 'Ada Nwosu', email: 'ada.nwosu@gmail.com', phone: '+234 803 456 7890', plan: 'Growth Monthly', status: 'past_due', card_last_four: '1234', total_paid: 1500000, created_at: '2026-03-22', invoices: [
    { id: 'inv_102', amount: 300000, status: 'failed', date: '2026-06-22' },
    { id: 'inv_093', amount: 300000, status: 'paid', date: '2026-05-22' },
  ] },
  { id: 'cust_003', name: 'Tunde Bello', email: 'tunde.b@company.ng', phone: null, plan: 'Starter Monthly', status: 'active', card_last_four: '8765', total_paid: 800000, created_at: '2026-01-10', invoices: [
    { id: 'inv_103', amount: 100000, status: 'paid', date: '2026-06-10' },
    { id: 'inv_094', amount: 100000, status: 'paid', date: '2026-05-10' },
  ] },
  { id: 'cust_004', name: 'Chioma Eze', email: 'chioma.eze@outlook.com', phone: '+234 805 678 9012', plan: 'Premium Monthly', status: 'active', card_last_four: '3456', total_paid: 2500000, created_at: '2026-03-01', invoices: [] },
  { id: 'cust_005', name: 'Babajide Okonkwo', email: 'bj.okonkwo@mail.com', phone: '+234 806 789 0123', plan: 'Annual Pro', status: 'active', card_last_four: '7890', total_paid: 12000000, created_at: '2025-12-05', invoices: [] },
]

export const mockReportsData = {
  summary: {
    total_revenue_kobo: 184500000,
    successful_payments: 287,
    failed_payments: 43,
    recovery_rate_pct: 71,
  },
  transactions: [
    { id: 'tx_001', reference: 'flx_inv_8821', customer: 'Emeka Obi', plan: 'Premium Monthly', amount: 500000, status: 'paid', date: '2026-06-28' },
    { id: 'tx_002', reference: 'flx_inv_8822', customer: 'Ada Nwosu', plan: 'Growth Monthly', amount: 300000, status: 'failed', date: '2026-06-27' },
    { id: 'tx_003', reference: 'flx_inv_8823', customer: 'Tunde Bello', plan: 'Starter Monthly', amount: 100000, status: 'paid', date: '2026-06-27' },
    { id: 'tx_004', reference: 'flx_inv_8824', customer: 'Chioma Eze', plan: 'Premium Monthly', amount: 500000, status: 'recovered', date: '2026-06-26' },
    { id: 'tx_005', reference: 'flx_inv_8825', customer: 'Babajide Okonkwo', plan: 'Annual Pro', amount: 12000000, status: 'paid', date: '2026-06-25' },
    { id: 'tx_006', reference: 'flx_inv_8826', customer: 'Emeka Obi', plan: 'Premium Monthly', amount: 500000, status: 'partially_paid', date: '2026-06-24' },
    { id: 'tx_007', reference: 'flx_inv_8827', customer: 'Ada Nwosu', plan: 'Growth Monthly', amount: 300000, status: 'recovered', date: '2026-06-23' },
  ],
}

export const mockAdminReportsData = {
  summary: {
    platform_revenue_kobo: 892000000,
    total_transactions: 1847,
    active_merchants: 24,
    recovery_rate_pct: 68,
  },
  merchant_breakdown: [
    { id: 'm1', name: 'Adaeze Gym', revenue_kobo: 245000000, transactions: 487, recovery_pct: 74 },
    { id: 'm2', name: 'TechHub NG', revenue_kobo: 189000000, transactions: 356, recovery_pct: 65 },
    { id: 'm3', name: 'Lagos Fitness', revenue_kobo: 156000000, transactions: 298, recovery_pct: 71 },
    { id: 'm4', name: 'EduPlatform', revenue_kobo: 134000000, transactions: 412, recovery_pct: 82 },
    { id: 'm5', name: 'MealPrep NG', revenue_kobo: 98000000, transactions: 194, recovery_pct: 45 },
  ],
  transactions: [
    { id: 'atx_001', reference: 'flx_adm_001', merchant: 'Adaeze Gym', customer: 'Emeka Obi', plan: 'Premium Monthly', amount: 500000, status: 'paid', date: '2026-06-28' },
    { id: 'atx_002', reference: 'flx_adm_002', merchant: 'TechHub NG', customer: 'Ngozi Okoli', plan: 'Team Pro', amount: 2500000, status: 'paid', date: '2026-06-28' },
    { id: 'atx_003', reference: 'flx_adm_003', merchant: 'Lagos Fitness', customer: 'Kola Adesanya', plan: 'Monthly Pass', amount: 350000, status: 'failed', date: '2026-06-27' },
    { id: 'atx_004', reference: 'flx_adm_004', merchant: 'EduPlatform', customer: 'Funke Adeyemi', plan: 'Student Monthly', amount: 150000, status: 'recovered', date: '2026-06-27' },
    { id: 'atx_005', reference: 'flx_adm_005', merchant: 'MealPrep NG', customer: 'Yusuf Ibrahim', plan: 'Family Plan', amount: 800000, status: 'partially_paid', date: '2026-06-26' },
    { id: 'atx_006', reference: 'flx_adm_006', merchant: 'Adaeze Gym', customer: 'Ada Nwosu', plan: 'Growth Monthly', amount: 300000, status: 'paid', date: '2026-06-26' },
  ],
}
