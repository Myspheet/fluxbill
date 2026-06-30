import { useEffect, useState } from 'react'
import Modal from './Modal'
import { Select } from './FormInputs'
import { useToast } from './Toast'
import api from '../lib/apiClient'
import { nairaToKobo } from '../lib/format'

export default function CreatePlanModal({ open, onClose, onSuccess, plan = null }) {
  const toast = useToast()
  const isEdit = !!plan
  const [form, setForm] = useState({ name: '', amount_naira: '', interval: 'monthly', trial_days: 0, description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name || '',
        amount_naira: plan.amount ? (plan.amount / 100).toString() : '',
        interval: plan.interval || 'monthly',
        trial_days: plan.trial_days || 0,
        description: plan.description || '',
      })
    } else {
      setForm({ name: '', amount_naira: '', interval: 'monthly', trial_days: 0, description: '' })
    }
    setError(null)
  }, [plan, open])

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        amount: nairaToKobo(form.amount_naira),
        interval: form.interval,
        trial_days: Number(form.trial_days) || 0,
      }
      if (form.description) payload.description = form.description

      let res
      if (isEdit) {
        res = await api.patch(`/plans/${plan.id}`, payload)
      } else {
        res = await api.post('/plans', payload)
      }
      const result = res.data.data
      toast.success(isEdit ? `Plan "${result.name}" updated` : `Plan "${result.name}" created successfully`)
      onSuccess?.(result)
      onClose()
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-lg">
      <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Edit plan' : 'Create a new plan'}</h2>
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <div>
          <label className="label">Plan name</label>
          <input className="input" value={form.name} onChange={update('name')} placeholder="Monthly Gym Membership" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Amount (₦)</label>
            <input className="input" type="number" min="1" step="0.01" value={form.amount_naira} onChange={update('amount_naira')} placeholder="5000" required />
          </div>
          <Select
            label="Billing interval"
            value={form.interval}
            onChange={(val) => setForm({ ...form, interval: val })}
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'annual', label: 'Annual' },
              { value: 'custom', label: 'Custom' },
            ]}
            placeholder=""
          />
        </div>
        <div>
          <label className="label">Trial days</label>
          <input className="input" type="number" min="0" value={form.trial_days} onChange={update('trial_days')} />
        </div>
        <div>
          <label className="label">Description (optional)</label>
          <textarea className="input" rows="2" value={form.description} onChange={update('description')} placeholder="Brief description of what this plan includes" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 btn-ghost">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary">
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create plan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
