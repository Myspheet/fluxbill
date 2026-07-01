import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { Select } from '../../components/FormInputs'
import { formatKobo } from '../../lib/format'
import api from '../../lib/apiClient'

export default function Portal() {
  const { token } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [toast, setToast] = useState(null)

  const fetchPortalData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data: response } = await api.get(`/portal/${token}/subscription`)
      setData(response)
      if (response.plans?.length > 0) {
        setSelectedPlanId(response.plans[0].id)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load portal')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchPortalData() }, [fetchPortalData])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (message, type) => setToast({ message, type })

  const handleCancel = async () => {
    if (!data) return
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription?\n\nYou will continue to have access until the end of your current billing period.'
    )
    if (!confirmed) return

    try {
      setActionLoading('cancel')
      const { data: response } = await api.post(
        '/portal/cancel',
        {},
        { headers: { 'X-Portal-Session': data.session_token } }
      )
      setData({
        ...data,
        subscription: { ...data.subscription, cancel_at_period_end: true }
      })
      showToast(response.message || 'Subscription cancelled successfully.', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to cancel subscription.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateCard = async () => {
    if (!data) return
    try {
      setActionLoading('update-card')
      const { data: response } = await api.post(
        '/portal/update-card',
        {},
        { headers: { 'X-Portal-Session': data.session_token } }
      )
      window.location.href = response.checkout_url
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to initiate card update.', 'error')
      setActionLoading(null)
    }
  }

  const handleChangePlan = async (e) => {
    e.preventDefault()
    if (!data || !selectedPlanId || selectedPlanId === data.subscription.plan_id) return

    const currentPlan = data.plans.find(p => p.id === data.subscription.plan_id)
    const newPlan = data.plans.find(p => p.id === selectedPlanId)
    if (!currentPlan || !newPlan) return

    const isUpgrade = newPlan.amount > currentPlan.amount
    const action = isUpgrade ? 'upgrade' : 'downgrade'
    const confirmed = window.confirm(
      `You are about to ${action} your plan.\n\nCurrent: ${currentPlan.name} (${formatKobo(currentPlan.amount)}/${currentPlan.interval})\nNew: ${newPlan.name} (${formatKobo(newPlan.amount)}/${newPlan.interval})\n\nYour payment will be prorated automatically.`
    )
    if (!confirmed) return

    try {
      setActionLoading('change-plan')
      const { data: response } = await api.post(
        '/portal/change-plan',
        { new_plan_id: selectedPlanId },
        { headers: { 'X-Portal-Session': data.session_token } }
      )
      setData({
        ...data,
        subscription: {
          ...data.subscription,
          plan: newPlan.name,
          plan_id: newPlan.id,
          amount: newPlan.amount,
        }
      })
      showToast(response.message || `Plan changed to ${newPlan.name} successfully.`, 'success')
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to change plan.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <LoadingSkeleton />

  if (error || !data) {
    return (
      <ErrorState
        message={error || 'This portal link is invalid, expired, or has already been used.'}
        onRetry={fetchPortalData}
      />
    )
  }

  const { subscription, invoices, plans } = data
  const isCancelling = actionLoading === 'cancel'
  const isUpdatingCard = actionLoading === 'update-card'
  const isChangingPlan = actionLoading === 'change-plan'

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className={`rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-nomba-yellow font-black text-nomba-black text-xs">
              F
            </div>
            <div>
              <h1 className="text-base font-bold text-ink">Manage Subscription</h1>
              <p className="text-xs text-neutral-400">{subscription.email}</p>
            </div>
          </div>
          <StatusBadge status={subscription.status} />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 space-y-5">
        {/* Subscription overview */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Current Plan</p>
              <h2 className="mt-1 text-lg font-bold text-ink">{subscription.plan}</h2>
              <p className="text-sm text-neutral-500">{subscription.customer}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-ink">{formatKobo(subscription.amount)}</p>
              <p className="text-xs text-neutral-500">per billing cycle</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 border-t border-neutral-100 pt-5">
            <InfoItem label="Next billing" value={subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
            <InfoItem label="Payment method" value={subscription.card_last_four ? `•••• ${subscription.card_last_four}` : '—'} />
            <InfoItem label="Status" value={<span className="capitalize">{subscription.status?.replace(/_/g, ' ')}</span>} />
          </div>

          {/* Cancellation notice */}
          {subscription.cancel_at_period_end && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
              <svg className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-amber-800">Your subscription will end at the end of the current billing period.</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleUpdateCard}
              disabled={!!actionLoading}
              className="btn-primary"
            >
              {isUpdatingCard ? 'Redirecting…' : 'Update card'}
            </button>

            {!subscription.cancel_at_period_end && subscription.status !== 'cancelled' && (
              <button
                onClick={handleCancel}
                disabled={!!actionLoading}
                className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling…' : 'Cancel subscription'}
              </button>
            )}
          </div>
        </div>

        {/* Change Plan */}
        {plans && plans.length > 1 && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h3 className="font-semibold text-ink">Change Plan</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Upgrade or downgrade mid-cycle — your payment will be prorated automatically.
            </p>

            <form onSubmit={handleChangePlan} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Select
                  label="Available Plans"
                  value={selectedPlanId}
                  onChange={(val) => setSelectedPlanId(val)}
                  placeholder="Select a plan"
                  options={plans.map((plan) => ({
                    value: plan.id,
                    label: `${plan.name} — ${formatKobo(plan.amount)}/${plan.interval}${plan.id === subscription.plan_id ? ' (current)' : ''}`,
                  }))}
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPlan || selectedPlanId === subscription.plan_id}
                className="btn-primary shrink-0"
              >
                {isChangingPlan ? 'Changing…' : 'Change plan'}
              </button>
            </form>
          </div>
        )}

        {/* Invoice History */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold text-ink">Invoice History</h3>

          {(!invoices || invoices.length === 0) ? (
            <div className="mt-4 py-8 text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-neutral-100 grid place-items-center mb-2">
                <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <p className="text-sm text-neutral-500">No invoices yet.</p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto -mx-5 px-5 sm:-mx-6 sm:px-6">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b border-neutral-100 text-left text-neutral-500">
                    <th className="pb-2.5 pr-4 font-medium">Invoice</th>
                    <th className="pb-2.5 pr-4 font-medium">Date</th>
                    <th className="pb-2.5 pr-4 font-medium text-right">Amount</th>
                    <th className="pb-2.5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-neutral-50 last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs text-neutral-600 truncate max-w-[120px]">
                        {inv.id}
                      </td>
                      <td className="py-3 pr-4 text-neutral-600 whitespace-nowrap">
                        {inv.date || (inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-ink">
                        {formatKobo(inv.amount)}
                      </td>
                      <td className="py-3 text-right">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-100 mt-4">
        <div className="mx-auto max-w-2xl px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <p className="text-xs text-neutral-400">Secure portal · Link expires in 60 minutes</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-neutral-100 py-5 px-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3 animate-pulse">
          <div className="h-9 w-9 rounded-lg bg-neutral-200" />
          <div>
            <div className="h-4 w-36 rounded bg-neutral-200" />
            <div className="mt-1 h-3 w-24 rounded bg-neutral-100" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-5 animate-pulse">
        <div className="h-52 rounded-2xl border border-neutral-100 bg-neutral-50" />
        <div className="h-32 rounded-2xl border border-neutral-100 bg-neutral-50" />
        <div className="h-40 rounded-2xl border border-neutral-100 bg-neutral-50" />
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-neutral-50 grid place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm border border-neutral-100">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50">
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="mt-4 text-lg font-bold text-ink">Link unavailable</h1>
        <p className="mt-1 text-sm text-neutral-500">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-5 btn-primary">
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
