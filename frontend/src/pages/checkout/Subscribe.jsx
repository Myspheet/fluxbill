import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mockPlan } from '../../lib/mockData'
import { formatKobo } from '../../lib/format'

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
    if (isGroup) {
      navigate(`/subscribe/${plan.id}/members?seats=${seats}`)
    } else {
      navigate(`/payment/return?ref=demo_inv_preview`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Merchant branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-neutral-200 px-4 py-2 shadow-sm">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-nomba-yellow font-black text-nomba-black text-[10px]">
              F
            </span>
            <span className="text-sm text-neutral-600">
              {plan.merchant_name} <span className="text-neutral-400">· powered by FluxBill</span>
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
          {/* Plan header */}
          <div className="bg-nomba-black px-6 py-6 text-white">
            <h1 className="text-xl font-bold">{plan.name}</h1>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-nomba-yellow">{formatKobo(plan.amount)}</span>
              <span className="text-neutral-400">/ {plan.interval}</span>
            </div>
            {plan.trial_days > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-900/30 px-3 py-1 text-sm text-green-300">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {plan.trial_days}-day free trial
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={subscribe} className="px-6 py-6 space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                className="input"
                value={form.name}
                onChange={update('name')}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Group subscription toggle */}
            <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isGroup}
                  onChange={(e) => setIsGroup(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-5 w-9 rounded-full bg-neutral-200 peer-checked:bg-nomba-yellow transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4"></div>
              </div>
              <div>
                <span className="text-sm font-medium">Subscribe as a group</span>
                <p className="text-xs text-neutral-500">Add multiple seats to this subscription</p>
              </div>
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
                  Total: {formatKobo(plan.amount * seats)} / {plan.interval}
                </p>
              </div>
            )}

            <button className="w-full btn-primary py-3 text-base mt-2">
              Subscribe now
            </button>

            <div className="flex items-center justify-center gap-2 pt-2">
              <LockIcon className="h-3.5 w-3.5 text-neutral-400" />
              <p className="text-xs text-neutral-400">
                Secure payment via Nomba. Your card details are never stored on our servers.
              </p>
            </div>
          </form>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <ShieldIcon className="h-3.5 w-3.5" /> PCI Compliant
          </span>
          <span className="text-neutral-300">·</span>
          <span className="flex items-center gap-1">
            <LockIcon className="h-3.5 w-3.5" /> 256-bit SSL
          </span>
          <span className="text-neutral-300">·</span>
          <span className="flex items-center gap-1">
            <CheckIcon className="h-3.5 w-3.5" /> Cancel anytime
          </span>
        </div>
      </div>
    </div>
  )
}

function LockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

function ShieldIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}
