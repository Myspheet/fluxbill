import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/apiClient'
import { formatKobo } from '../../lib/format'

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

  useEffect(() => {
    const fetchStorefront = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data: response } = await api.get(`/merchants/${merchantId}/storefront`)
        setMerchant(response.data.merchant)
        setPlans(response.data.plans || [])
        if (response.data.existing_subscription) {
          setExistingSubscription(response.data.existing_subscription)
        }
        if (response.data.plans?.length > 0) {
          setSelectedPlan(response.data.plans[0])
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load storefront')
      } finally {
        setLoading(false)
      }
    }
    fetchStorefront()
  }, [merchantId])

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

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
        merchant_id: merchantId,
      })
      window.location.href = response.checkout_url
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Subscription failed')
      setSubmitting(false)
    }
  }

  const handleManageSubscription = () => {
    if (existingSubscription?.portal_token) {
      navigate(`/portal/${existingSubscription.portal_token}`)
    } else {
      navigate(`/merchants/${merchantId}/portal`)
    }
  }

  if (loading) return <LoadingSkeleton />

  if (existingSubscription) {
    return (
      <AlreadySubscribed
        customer={existingSubscription}
        merchant={merchant}
        onManageSubscription={handleManageSubscription}
      />
    )
  }

  if (!merchant) {
    return (
      <ErrorState
        message={error || 'This merchant storefront does not exist.'}
        onAction={() => window.history.back()}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 text-center">
          <div className="inline-grid h-14 w-14 place-items-center rounded-xl bg-nomba-yellow font-black text-nomba-black text-xl">
            {merchant.name?.charAt(0)?.toUpperCase() || 'M'}
          </div>
          <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{merchant.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">Choose a plan to get started</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Plans */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Plans</h2>
              <span className="text-xs text-neutral-400">{plans.length} available</span>
            </div>

            {plans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center">
                <p className="text-sm text-neutral-500">No plans available at the moment.</p>
              </div>
            ) : (
              plans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full text-left rounded-2xl border-2 bg-white p-5 transition-all ${
                      isSelected
                        ? 'border-nomba-yellow shadow-md ring-2 ring-nomba-yellow/20'
                        : 'border-neutral-100 hover:border-neutral-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-nomba-yellow bg-nomba-yellow' : 'border-neutral-300'
                          }`}>
                            {isSelected && (
                              <svg className="h-2.5 w-2.5 text-nomba-black" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </svg>
                            )}
                          </div>
                          <h3 className="font-semibold text-ink">{plan.name}</h3>
                        </div>
                        {plan.description && (
                          <p className="mt-1 pl-6 text-sm text-neutral-500">{plan.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-ink">{formatKobo(plan.amount)}</p>
                        <p className="text-xs text-neutral-500">per {plan.interval}</p>
                      </div>
                    </div>
                    {plan.trial_days > 0 && (
                      <div className="mt-3 pl-6">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          {plan.trial_days}-day free trial
                        </span>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Checkout sidebar */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
              {selectedPlan ? (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div>
                    <h2 className="font-semibold text-ink">Subscribe</h2>
                    <div className="mt-2 rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-2.5">
                      <p className="text-sm font-medium text-ink">{selectedPlan.name}</p>
                      <p className="text-xs text-neutral-500">
                        {formatKobo(selectedPlan.amount)} / {selectedPlan.interval}
                        {selectedPlan.trial_days > 0 && (
                          <span className="ml-1 text-green-600">· {selectedPlan.trial_days} days free</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="label">Full name</label>
                    <input
                      className="input"
                      value={form.name}
                      onChange={update('name')}
                      required
                      placeholder="Emeka Okonkwo"
                    />
                  </div>

                  <div>
                    <label className="label">Email address</label>
                    <input
                      className="input"
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      required
                      placeholder="emeka@example.com"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 rounded-lg border border-neutral-200 px-3 py-2.5 cursor-pointer hover:bg-neutral-50 transition">
                    <input
                      type="checkbox"
                      checked={isGroup}
                      onChange={(e) => setIsGroup(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-nomba-yellow focus:ring-nomba-yellow"
                    />
                    <span className="text-sm text-neutral-700">
                      Group subscription <span className="text-neutral-400">(multiple seats)</span>
                    </span>
                  </label>

                  {isGroup && (
                    <div className="animate-fade-in">
                      <label className="label">Number of seats</label>
                      <input
                        className="input"
                        type="number"
                        min="2"
                        value={seats}
                        onChange={(e) => setSeats(Number(e.target.value))}
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Total: {formatKobo(selectedPlan.amount * seats)} / {selectedPlan.interval}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-primary py-3"
                  >
                    {submitting ? 'Processing…' : 'Subscribe now'}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    <svg className="h-3.5 w-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    <p className="text-[11px] text-neutral-400">Secured by FluxBill & Nomba</p>
                  </div>
                </form>
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto h-10 w-10 rounded-full bg-neutral-100 grid place-items-center mb-3">
                    <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
                    </svg>
                  </div>
                  <p className="text-sm text-neutral-500">Select a plan to continue</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-100 mt-8">
        <div className="mx-auto max-w-5xl px-4 py-5 text-center">
          <p className="text-xs text-neutral-400">
            Powered by <span className="font-semibold text-neutral-500">FluxBill</span> — Recurring payment recovery for Nigerian businesses
          </p>
        </div>
      </footer>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-neutral-100 py-8 text-center animate-pulse">
        <div className="mx-auto h-14 w-14 rounded-xl bg-neutral-200" />
        <div className="mt-3 h-7 w-40 mx-auto rounded bg-neutral-200" />
        <div className="mt-2 h-4 w-52 mx-auto rounded bg-neutral-100" />
      </div>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl border border-neutral-100 bg-neutral-50 animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-2">
            <div className="h-80 rounded-2xl border border-neutral-100 bg-neutral-50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message, onAction }) {
  return (
    <div className="min-h-screen bg-neutral-50 grid place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm border border-neutral-100">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50">
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="mt-4 text-lg font-bold text-ink">Store unavailable</h1>
        <p className="mt-1 text-sm text-neutral-500">{message}</p>
        {onAction && (
          <button onClick={onAction} className="mt-5 btn-primary">
            Go back
          </button>
        )}
      </div>
    </div>
  )
}

function AlreadySubscribed({ customer, merchant, onManageSubscription }) {
  return (
    <div className="min-h-screen bg-neutral-50 grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-neutral-100">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-50">
          <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-bold text-ink">You're already subscribed</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {customer?.name || 'You'} have an active subscription with {merchant?.name || 'this merchant'}.
        </p>
        <button onClick={onManageSubscription} className="mt-6 btn-primary">
          Manage subscription
        </button>
        <p className="mt-3 text-xs text-neutral-400">
          View invoices, update card, or change your plan.
        </p>
      </div>
    </div>
  )
}
