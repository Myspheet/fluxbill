import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../lib/apiClient'
import { formatKobo } from '../../lib/format'

export default function Subscribe() {
  const { planId } = useParams()
  const navigate = useNavigate()
  
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [form, setForm] = useState({ name: '', email: '' })
  const [isGroup, setIsGroup] = useState(false)
  const [seats, setSeats] = useState(2)

  useEffect(() => {
    api.get(`/plans/${planId}/public`)
      .then(({ data }) => {
        setPlan(data.data || data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [planId])

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function subscribe(e) {
    e.preventDefault()
    if (!plan) return

    setSubmitting(true)
    setError(null)

    api.post('/subscriptions/checkout', {
      plan_id: plan.id,
      name: form.name,
      email: form.email,
      seats: isGroup ? seats : 1
    })
      .then(({ data }) => {
        window.location.href = data.checkout_url
      })
      .catch((err) => {
        setError(err.message)
        setSubmitting(false)
      })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 grid place-items-center">
        <p className="text-sm text-neutral-500 font-medium animate-pulse">Loading checkout details…</p>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-neutral-50 grid place-items-center px-6">
        <div className="w-full max-w-md card text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600 text-xl font-bold mb-4">
            !
          </div>
          <h1 className="text-lg font-bold text-neutral-900">Plan not found</h1>
          <p className="mt-2 text-sm text-neutral-500">{error || 'This subscription plan is not available.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-md">
        <p className="mb-4 text-center text-sm text-neutral-500">{plan.merchant_name} · powered by FluxBill</p>
        <div className="card">
          <div className="mb-5">
            <h1 className="text-xl font-bold">{plan.name}</h1>
            <p className="mt-1 text-3xl font-bold">
              {formatKobo(plan.amount)}
              <span className="text-base font-medium text-neutral-500"> / {plan.interval}</span>
            </p>
            {plan.trial_days > 0 && (
              <p className="mt-1 text-sm text-green-700">{plan.trial_days}-day free trial</p>
            )}
          </div>

          <form onSubmit={subscribe} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={form.name} onChange={update('name')} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={update('email')} required />
            </div>

            <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5">
              <input type="checkbox" checked={isGroup} onChange={(e) => setIsGroup(e.target.checked)} />
              <span className="text-sm font-medium">Subscribe as a group?</span>
            </label>
            {isGroup && (
              <div>
                <label className="label">Number of seats</label>
                <input
                  className="input"
                  type="number"
                  min="2"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                />
              </div>
            )}

            <button disabled={submitting} className="w-full btn-primary">
              {submitting ? 'Processing…' : 'Subscribe now'}
            </button>
            <p className="text-center text-xs text-neutral-400">
              You'll be redirected to Nomba's secure checkout to enter your card.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
