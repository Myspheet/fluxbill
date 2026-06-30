import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { formatKobo } from '../../lib/format'
import api from '../../lib/apiClient'

// ============================================================
// LOADING SKELETON
// ============================================================
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-neutral-50 px-6 py-10">
    <div className="mx-auto max-w-2xl animate-pulse">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-neutral-200" />
        <div className="h-6 w-48 rounded bg-neutral-200" />
      </div>

      {/* Main Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-neutral-200" />
            <div className="h-6 w-48 rounded bg-neutral-200" />
          </div>
          <div className="h-8 w-20 rounded-full bg-neutral-200" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-3 w-16 rounded bg-neutral-200" />
              <div className="mt-1 h-4 w-24 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <div className="h-11 w-32 rounded-lg bg-neutral-200" />
          <div className="h-11 w-40 rounded-lg bg-neutral-200" />
        </div>
      </div>
    </div>
  </div>
)

// ============================================================
// ERROR STATES
// ============================================================
const ErrorState = ({ message, onRetry }) => (
  <div className="min-h-screen bg-neutral-50 grid place-items-center px-6">
    <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="mt-4 text-xl font-bold text-neutral-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-neutral-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 bg-nomba-yellow text-nomba-black py-2.5 px-6 rounded-lg text-sm font-medium hover:bg-nomba-yellow/90 transition"
        >
          Try again
        </button>
      )}
    </div>
  </div>
)

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Portal() {
  const { token } = useParams()

  // State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [toast, setToast] = useState(null)

  // ============================================================
  // FETCH DATA
  // ============================================================
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
      const message = err.response?.data?.message || err.message || 'Failed to load portal'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchPortalData()
  }, [fetchPortalData])

  // ============================================================
  // TOAST NOTIFICATIONS
  // ============================================================
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  // ============================================================
  // ACTIONS
  // ============================================================
  const handleCancel = async () => {
    if (!data) return

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription?\n\n' +
      'You will continue to have access until the end of your current billing period.'
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

      // Redirect to Nomba checkout
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
      `You are about to ${action} your plan.\n\n` +
      `Current: ${currentPlan.name} (${formatKobo(currentPlan.amount)}/${currentPlan.interval})\n` +
      `New: ${newPlan.name} (${formatKobo(newPlan.amount)}/${newPlan.interval})\n\n` +
      `Your payment will be prorated automatically.`
    )

    if (!confirmed) return

    try {
      setActionLoading('change-plan')
      const { data: response } = await api.post(
        '/portal/change-plan',
        { new_plan_id: selectedPlanId },
        { headers: { 'X-Portal-Session': data.session_token } }
      )

      // Update local state
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

  // ============================================================
  // RENDER: LOADING
  // ============================================================
  if (loading) {
    return <LoadingSkeleton />
  }

  // ============================================================
  // RENDER: ERROR
  // ============================================================
  if (error || !data) {
    return (
      <ErrorState
        message={error || 'This portal link is invalid, expired, or has already been used.'}
        onRetry={fetchPortalData}
      />
    )
  }

  const { subscription, invoices, plans } = data
  const isChangingPlan = actionLoading === 'change-plan'
  const isCancelling = actionLoading === 'cancel'
  const isUpdatingCard = actionLoading === 'update-card'

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        {/* ============================================================
            TOAST
        ============================================================ */}
        {toast && (
          <div className="mb-4 animate-slide-down">
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
              {toast.message}
            </div>
          </div>
        )}

        {/* ============================================================
            HEADER
        ============================================================ */}
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-nomba-yellow font-black text-nomba-black text-sm">
            F
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Manage Subscription</h1>
            <p className="text-xs text-neutral-400">{subscription.email}</p>
          </div>
        </div>

        {/* ============================================================
            SUBSCRIPTION CARD
        ============================================================ */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-500">{subscription.customer}</p>
              <h2 className="mt-0.5 text-xl font-bold text-neutral-900">{subscription.plan}</h2>
            </div>
            <StatusBadge status={subscription.status} />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-neutral-500">Amount</dt>
              <dd className="font-semibold text-neutral-900">{formatKobo(subscription.amount)}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Next billing</dt>
              <dd className="font-semibold text-neutral-900">
                {subscription.next_billing_date || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Card</dt>
              <dd className="font-semibold text-neutral-900">•••• {subscription.card_last_four}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Status</dt>
              <dd className="font-semibold text-neutral-900 capitalize">{subscription.status}</dd>
            </div>
          </dl>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleUpdateCard}
              disabled={!!actionLoading}
              className="bg-nomba-yellow text-nomba-black py-2.5 px-5 rounded-lg text-sm font-medium hover:bg-nomba-yellow/90 transition disabled:opacity-50"
            >
              {isUpdatingCard ? 'Redirecting…' : 'Update Card'}
            </button>

            {!subscription.cancel_at_period_end && subscription.status !== 'cancelled' && (
              <button
                onClick={handleCancel}
                disabled={!!actionLoading}
                className="border border-neutral-200 hover:bg-neutral-50 text-neutral-700 py-2.5 px-5 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling…' : 'Cancel Subscription'}
              </button>
            )}
          </div>

          {/* Cancellation notice */}
          {subscription.cancel_at_period_end && (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              ⚠️ Your subscription will end at the end of the current billing period.
            </div>
          )}
        </div>

        {/* ============================================================
            CHANGE PLAN
        ============================================================ */}
        {plans.length > 1 && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900">Change Plan</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Upgrade or downgrade mid-cycle — your payment will be prorated automatically.
            </p>

            <form onSubmit={handleChangePlan} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="plan-select" className="text-sm font-medium text-neutral-700">
                  Available Plans
                </label>
                <select
                  id="plan-select"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-nomba-yellow focus:ring-2 focus:ring-nomba-yellow/20"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {formatKobo(plan.amount)}/{plan.interval}
                      {plan.id === subscription.plan_id && ' (current)'}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isChangingPlan || selectedPlanId === subscription.plan_id}
                className="bg-nomba-yellow text-nomba-black py-2.5 px-6 rounded-lg text-sm font-medium shrink-0 hover:bg-nomba-yellow/90 transition disabled:opacity-50"
              >
                {isChangingPlan ? 'Changing…' : 'Change Plan'}
              </button>
            </form>
          </div>
        )}

        {/* ============================================================
            INVOICE HISTORY
        ============================================================ */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">Invoice History</h3>

          {invoices.length === 0 ? (
            <p className="mt-4 text-center text-sm text-neutral-400 py-4">No invoices yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-left text-neutral-500">
                    <th className="pb-2 pr-4 font-medium">Invoice</th>
                    <th className="pb-2 pr-4 font-medium">Date</th>
                    <th className="pb-2 pr-4 font-medium text-right">Amount</th>
                    <th className="pb-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-neutral-50 last:border-0">
                      <td className="py-2.5 pr-4 font-mono text-xs text-neutral-600 truncate max-w-[80px]">
                        {inv.id}
                      </td>
                      <td className="py-2.5 pr-4 text-neutral-600 whitespace-nowrap">{inv.date}</td>
                      <td className="py-2.5 pr-4 text-right font-semibold text-neutral-900">
                        {formatKobo(inv.amount)}
                      </td>
                      <td className="py-2.5 text-right">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ============================================================
            FOOTER
        ============================================================ */}
        <p className="mt-6 text-center text-xs text-neutral-400">
          🔒 Secure portal • Link expires in 60 minutes
        </p>
      </div>
    </div>
  )
}