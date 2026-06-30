import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/apiClient'
import { formatKobo } from '../../lib/format'

// ============================================================
// LOADING SKELETON
// ============================================================
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-neutral-50 py-12 px-6">
    <div className="mx-auto max-w-5xl">
      <div className="mb-10 text-center animate-pulse">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-neutral-200" />
        <div className="mt-4 h-8 w-48 mx-auto rounded bg-neutral-200" />
        <div className="mt-2 h-4 w-64 mx-auto rounded bg-neutral-200" />
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white p-6 shadow-sm animate-pulse">
              <div className="h-6 w-3/4 rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
              <div className="mt-4 h-8 w-32 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-5">
          <div className="h-96 rounded-2xl bg-white p-6 shadow-sm animate-pulse">
            <div className="h-6 w-48 rounded bg-neutral-200" />
            <div className="mt-6 space-y-4">
              <div className="h-12 rounded bg-neutral-200" />
              <div className="h-12 rounded bg-neutral-200" />
              <div className="h-12 rounded bg-neutral-200" />
              <div className="h-14 rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// ============================================================
// ERROR STATES
// ============================================================
const ErrorState = ({ message, onAction, actionLabel = 'Go Back' }) => (
  <div className="min-h-screen bg-neutral-50 grid place-items-center px-6">
    <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="mt-4 text-xl font-bold text-neutral-900">Unable to load storefront</h1>
      <p className="mt-2 text-sm text-neutral-500">{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-6 bg-nomba-yellow text-nomba-black py-2.5 px-6 rounded-lg text-sm font-medium hover:bg-nomba-yellow/90 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  </div>
)

// ============================================================
// ALREADY SUBSCRIBED STATE
// ============================================================
const AlreadySubscribed = ({ customer, merchant, plans, onManageSubscription }) => {
  const [selectedPlan, setSelectedPlan] = useState(null)

  useEffect(() => {
    if (plans?.length > 0) {
      setSelectedPlan(plans[0])
    }
  }, [plans])

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-grid h-16 w-16 place-items-center rounded-2xl bg-green-100 text-green-700 text-3xl mb-4">
            ✅
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900">
            You're already subscribed!
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {customer?.name || 'You'} are currently subscribed to {merchant?.name}.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm text-center max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="text-left">
              <p className="text-xs text-neutral-400 uppercase font-semibold">Current Plan</p>
              <p className="text-lg font-bold text-neutral-900">
                {customer?.plan || 'Active Subscription'}
              </p>
            </div>
            <div className="h-12 w-px bg-neutral-200" />
            <div className="text-left">
              <p className="text-xs text-neutral-400 uppercase font-semibold">Status</p>
              <p className="text-lg font-bold text-green-600 capitalize">
                {customer?.status || 'Active'}
              </p>
            </div>
          </div>

          <button
            onClick={onManageSubscription}
            className="mt-4 bg-nomba-yellow text-nomba-black py-3 px-8 rounded-xl font-bold hover:bg-nomba-yellow/90 transition"
          >
            Manage Your Subscription
          </button>
          <p className="mt-3 text-xs text-neutral-400">
            View invoices, update payment method, or cancel your subscription.
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Storefront() {
  const { merchantId } = useParams()
  const navigate = useNavigate()

  const [merchant, setMerchant] = useState(null)
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [existingSubscription, setExistingSubscription] = useState(null)

  const [form, setForm] = useState({ name: '', email: '' })
  const [isGroup, setIsGroup] = useState(false)
  const [seats, setSeats] = useState(2)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // ============================================================
  // FETCH STOREFRONT DATA
  // ============================================================
  useEffect(() => {
    const fetchStorefront = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: response } = await api.get(`/merchants/${merchantId}/storefront`)

        setMerchant(response.data.merchant)
        setPlans(response.data.plans || [])

        // Check if customer already has a subscription
        if (response.data.existing_subscription) {
          setExistingSubscription(response.data.existing_subscription)
        }

        if (response.data.plans?.length > 0) {
          setSelectedPlan(response.data.plans[0])
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to load storefront'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchStorefront()
  }, [merchantId])

  // ============================================================
  // FORM HANDLERS
  // ============================================================
  const update = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value })
  }

  // ============================================================
  // HANDLE SUBSCRIPTION
  // ============================================================
  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!selectedPlan) return

    setSubmitting(true)
    setError(null)

    try {
      const { data: response } = await api.post('/subscriptions/checkout', {
        plan_id: selectedPlan.id,
        name: form.name,
        email: form.email,
        seats: isGroup ? seats : 1,
        merchant_id: merchantId
      })

      // Redirect to Nomba checkout
      window.location.href = response.checkout_url
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Subscription failed'
      setError(message)
      setSubmitting(false)
    }
  }

  // ============================================================
  // HANDLE MANAGE SUBSCRIPTION
  // ============================================================
  const handleManageSubscription = () => {
    if (existingSubscription?.portal_token) {
      navigate(`/portal/${existingSubscription.portal_token}`)
    } else {
      // Fallback: go to merchant portal generation
      navigate(`/merchants/${merchantId}/portal`)
    }
  }

  // ============================================================
  // RENDER: LOADING
  // ============================================================
  if (loading) {
    return <LoadingSkeleton />
  }

  // ============================================================
  // RENDER: ALREADY SUBSCRIBED
  // ============================================================
  if (existingSubscription) {
    return (
      <AlreadySubscribed
        customer={existingSubscription}
        merchant={merchant}
        plans={plans}
        onManageSubscription={handleManageSubscription}
      />
    )
  }

  // ============================================================
  // RENDER: ERROR
  // ============================================================
  if (error || !merchant) {
    return (
      <ErrorState
        message={error || 'This merchant storefront does not exist.'}
        onAction={() => window.history.back()}
        actionLabel="Go Back"
      />
    )
  }

  // ============================================================
  // RENDER: MAIN
  // ============================================================
  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* ============================================================
            HEADER
        ============================================================ */}
        <header className="mb-8 sm:mb-10 text-center">
          <div className="inline-grid h-16 w-16 place-items-center rounded-2xl bg-nomba-yellow font-black text-nomba-black text-2xl shadow-md">
            {merchant.name?.charAt(0)?.toUpperCase() || 'F'}
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            {merchant.name}
          </h1>
          {merchant.description && (
            <p className="mt-1 text-sm text-neutral-500">{merchant.description}</p>
          )}
          <p className="text-sm text-neutral-400 mt-1">
            Select a plan below to subscribe
          </p>
        </header>

        {/* ============================================================
            STOREFRONT GRID
        ============================================================ */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Plans Selection */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-neutral-800 mb-2">
              Available Plans
              <span className="ml-2 text-sm font-normal text-neutral-400">
                ({plans.length} {plans.length === 1 ? 'plan' : 'plans'})
              </span>
            </h2>

            {plans.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center text-neutral-400 text-sm shadow-sm">
                No active subscription plans available.
              </div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`rounded-2xl bg-white p-5 sm:p-6 shadow-sm cursor-pointer transition-all border-2 text-left relative ${selectedPlan?.id === plan.id
                      ? 'border-nomba-yellow shadow-md'
                      : 'border-transparent hover:border-neutral-200'
                    }`}
                >
                  {plan.trial_days > 0 && (
                    <span className="absolute top-3 right-3 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                      {plan.trial_days}-day free trial
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-neutral-900">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-neutral-500 mt-1">{plan.description}</p>
                  )}
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-neutral-950">
                      {formatKobo(plan.amount)}
                    </span>
                    <span className="text-sm font-medium text-neutral-500">
                      / {plan.interval}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm sticky top-6">
              <h2 className="text-lg font-bold text-neutral-800 mb-4">
                {selectedPlan ? 'Complete Subscription' : 'Select a Plan'}
              </h2>

              {selectedPlan ? (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  {/* Selected Plan Summary */}
                  <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3 mb-3">
                    <p className="text-xs text-neutral-400 uppercase font-semibold">
                      Selected Plan
                    </p>
                    <p className="text-sm font-bold text-neutral-800 mt-0.5">
                      {selectedPlan.name}
                    </p>
                    <p className="text-sm font-medium text-neutral-600 mt-0.5">
                      {formatKobo(selectedPlan.amount)} / {selectedPlan.interval}
                      {selectedPlan.trial_days > 0 && (
                        <span className="ml-2 text-xs font-normal text-green-600">
                          · {selectedPlan.trial_days} days free
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {/* Form Fields */}
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-neutral-700 block mb-1">
                      Full name
                    </label>
                    <input
                      id="name"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-nomba-yellow focus:ring-2 focus:ring-nomba-yellow/20 transition"
                      value={form.name}
                      onChange={update('name')}
                      required
                      placeholder="e.g. Emeka Okonkwo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-neutral-700 block mb-1">
                      Email address
                    </label>
                    <input
                      id="email"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-nomba-yellow focus:ring-2 focus:ring-nomba-yellow/20 transition"
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      required
                      placeholder="e.g. emeka@gmail.com"
                    />
                  </div>

                  {/* Group Subscription Toggle */}
                  <label className="flex items-center gap-2.5 rounded-lg border border-neutral-200 px-3 py-2.5 bg-neutral-50/50 cursor-pointer hover:bg-neutral-100/50 transition">
                    <input
                      type="checkbox"
                      checked={isGroup}
                      onChange={(e) => setIsGroup(e.target.checked)}
                      className="w-4 h-4 text-nomba-yellow focus:ring-nomba-yellow/20"
                    />
                    <span className="text-sm font-medium text-neutral-700">
                      Subscribe as a group
                      <span className="ml-1.5 text-xs font-normal text-neutral-400">
                        (pay for multiple people)
                      </span>
                    </span>
                  </label>

                  {/* Seats Input */}
                  {isGroup && (
                    <div className="animate-fadeIn">
                      <label htmlFor="seats" className="text-sm font-medium text-neutral-700 block mb-1">
                        Number of seats
                      </label>
                      <input
                        id="seats"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-nomba-yellow focus:ring-2 focus:ring-nomba-yellow/20 transition"
                        type="number"
                        min="2"
                        value={seats}
                        onChange={(e) => setSeats(Number(e.target.value))}
                      />
                      <p className="mt-1 text-xs text-neutral-400">
                        Total: {formatKobo(selectedPlan.amount * seats)} / {selectedPlan.interval}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-nomba-yellow text-nomba-black py-3 rounded-xl font-bold shadow-lg shadow-nomba-yellow/10 hover:bg-nomba-yellow/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Processing…' : 'Subscribe Now'}
                  </button>

                  <p className="text-center text-xs text-neutral-400">
                    🔒 Secure recurring payments powered by FluxBill & Nomba
                  </p>
                </form>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-neutral-400">
                    Please select a plan on the left to subscribe.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================
            FOOTER
        ============================================================ */}
        <footer className="mt-12 text-center text-xs text-neutral-400 border-t border-neutral-200/50 pt-6">
          <p>FluxBill — Recurring Payment Recovery for Nigerian Businesses</p>
        </footer>
      </div>
    </div>
  )
}