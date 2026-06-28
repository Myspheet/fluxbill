import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mockPlan } from '../../lib/mockData'
import { formatKobo } from '../../lib/format'

// Public subscribe page. Plan details would come from GET a plan by id; the
// "Subscribe Now" action calls POST /api/subscriptions/checkout and redirects to
// Nomba's hosted checkout — that call is IN-WINDOW (Day 2), so this is static UI.
export default function Subscribe() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const plan = { ...mockPlan, id: planId || mockPlan.id }
  const [form, setForm] = useState({ name: '', email: '' })
  const [isGroup, setIsGroup] = useState(false)
  const [seats, setSeats] = useState(2)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function subscribe(e) {
    e.preventDefault()
    // IN-WINDOW: POST /subscriptions/checkout -> window.location = checkout_url.
    // Pre-window we just simulate the post-checkout flow.
    if (isGroup) {
      navigate(`/subscribe/${plan.id}/members?seats=${seats}`)
    } else {
      navigate(`/payment/return?ref=demo_inv_preview`)
    }
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

            <button className="w-full btn-primary">Subscribe now</button>
            <p className="text-center text-xs text-neutral-400">
              You'll be redirected to Nomba's secure checkout to enter your card.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
