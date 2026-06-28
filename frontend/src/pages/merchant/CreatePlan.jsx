import { useState } from 'react'
import MerchantLayout from '../../components/MerchantLayout'
import { Field, ErrorBanner } from './Register'
import api from '../../lib/apiClient'
import { nairaToKobo } from '../../lib/format'

export default function CreatePlan() {
  const [form, setForm] = useState({
    name: '',
    amount_naira: '',
    interval: 'monthly',
    trial_days: 0,
    description: '',
  })
  const [error, setError] = useState(null)
  const [fieldErr, setFieldErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(null)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErr(null)
    try {
      const payload = {
        name: form.name,
        // Convert naira -> kobo before sending (money is integer kobo).
        amount: nairaToKobo(form.amount_naira),
        interval: form.interval,
        trial_days: Number(form.trial_days) || 0,
      }
      if (form.description) payload.description = form.description
      const { data } = await api.post('/plans', payload)
      setCreated(data.data)
    } catch (err) {
      setError(err.message)
      setFieldErr(err.field)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MerchantLayout>
      <div className="mx-auto max-w-xl">
        <h1 className="mb-1 text-2xl font-bold">Create a plan</h1>
        <p className="mb-6 text-sm text-neutral-500">A priced recurring offering your customers subscribe to.</p>

        {created && (
          <div className="card mb-6 border-green-200 bg-green-50">
            <p className="font-semibold text-green-800">Plan created ✓</p>
            <p className="mt-1 text-sm text-neutral-700">Share this subscribe link with your customers:</p>
            <code className="mt-2 block overflow-x-auto rounded-lg bg-white px-3 py-2 text-sm">
              {created.subscribe_url}
            </code>
          </div>
        )}

        <form onSubmit={submit} className="card space-y-4">
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <Field label="Plan name" error={fieldErr === 'name' && error}>
            <input className="input" value={form.name} onChange={update('name')} placeholder="Monthly Gym Membership" required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (₦)" error={fieldErr === 'amount' && error}>
              <input
                className="input"
                type="number"
                min="1"
                step="0.01"
                value={form.amount_naira}
                onChange={update('amount_naira')}
                placeholder="5000"
                required
              />
            </Field>
            <Field label="Billing interval">
              <select className="input" value={form.interval} onChange={update('interval')}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
                <option value="custom">Custom</option>
              </select>
            </Field>
          </div>
          <Field label="Trial days" error={fieldErr === 'trial_days' && error}>
            <input className="input" type="number" min="0" value={form.trial_days} onChange={update('trial_days')} />
          </Field>
          <Field label="Description (optional)">
            <textarea className="input" rows="2" value={form.description} onChange={update('description')} />
          </Field>
          <button disabled={loading} className="w-full btn-primary">
            {loading ? 'Creating…' : 'Create plan'}
          </button>
        </form>
      </div>
    </MerchantLayout>
  )
}
