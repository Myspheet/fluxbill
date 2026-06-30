import { useEffect, useState } from 'react'
import MerchantLayout from '../../components/MerchantLayout'
import { ConfirmModal } from '../../components/Modal'
import CreatePlanModal from '../../components/CreatePlanModal'
import StatusBadge from '../../components/StatusBadge'
import { useToast } from '../../components/Toast'
import api from '../../lib/apiClient'
import { formatKobo } from '../../lib/format'

export default function Plans() {
  const toast = useToast()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editPlan, setEditPlan] = useState(null)
  const [deletePlan, setDeletePlan] = useState(null)

  function fetchPlans() {
    setLoading(true)
    api
      .get('/plans')
      .then(({ data }) => setPlans(data.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPlans() }, [])

  function handleCreated(plan) {
    setCreateOpen(false)
    setPlans((prev) => [plan, ...prev])
  }

  function handleUpdated(updated) {
    setEditPlan(null)
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }

  function handleDeleted() {
    if (!deletePlan) return
    const { id, name } = deletePlan
    setPlans((prev) => prev.filter((p) => p.id !== id))
    setDeletePlan(null)
    toast.success(`Plan "${name}" archived`)
  }

  return (
    <MerchantLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Plan Management</h1>
          <p className="text-sm text-neutral-500">Create, edit, and manage your subscription plans.</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary w-full sm:w-auto">
          + Create plan
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="card py-12 text-center text-sm text-neutral-500">Loading plans…</div>
      ) : plans.length === 0 ? (
        <div className="card py-12 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-neutral-100">
            <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <p className="text-neutral-600 font-medium">No plans yet</p>
          <p className="mt-1 text-sm text-neutral-500">Create your first subscription plan to get started.</p>
          <button onClick={() => setCreateOpen(true)} className="mt-4 btn-primary">
            + Create plan
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => setEditPlan(plan)}
              onDelete={() => setDeletePlan(plan)}
            />
          ))}
        </div>
      )}

      {/* Create Plan Modal */}
      <CreatePlanModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreated}
      />

      {/* Edit Plan Modal */}
      <CreatePlanModal
        open={!!editPlan}
        onClose={() => setEditPlan(null)}
        onSuccess={handleUpdated}
        plan={editPlan}
      />

      {/* Delete Confirmation */}
      <DeletePlanModal
        plan={deletePlan}
        onClose={() => setDeletePlan(null)}
        onDeleted={handleDeleted}
        toast={toast}
      />
    </MerchantLayout>
  )
}

function PlanCard({ plan, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    if (plan.subscribe_url) {
      navigator.clipboard?.writeText(plan.subscribe_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="card flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-ink truncate">{plan.name}</h3>
          {plan.description && (
            <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">{plan.description}</p>
          )}
        </div>
        <StatusBadge status={plan.status} />
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-2xl font-bold">{formatKobo(plan.amount)}</span>
        <span className="text-sm text-neutral-500">/ {plan.interval}</span>
      </div>

      <div className="mt-auto space-y-2">
        {plan.trial_days > 0 && (
          <p className="text-xs text-green-700 font-medium">{plan.trial_days}-day free trial</p>
        )}

        {plan.subscribe_url && (
          <button
            onClick={copyLink}
            className="w-full truncate rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition"
          >
            {copied ? '✓ Copied!' : plan.subscribe_url}
          </button>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={onEdit} className="flex-1 btn-ghost py-2 text-sm">
            Edit
          </button>
          <button onClick={onDelete} className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}


function DeletePlanModal({ plan, onClose, onDeleted, toast }) {
  const [loading, setLoading] = useState(false)

  async function confirmDelete() {
    setLoading(true)
    try {
      await api.delete(`/plans/${plan.id}`)
      onDeleted()
    } catch (err) {
      toast.error(err.message)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmModal
      open={!!plan}
      onClose={onClose}
      onConfirm={confirmDelete}
      variant="danger"
      title={`Delete "${plan?.name}"?`}
      message="This will archive the plan. Existing subscriptions won't be affected, but no new customers can subscribe to it."
      confirmLabel="Delete plan"
      cancelLabel="Keep plan"
      loading={loading}
    />
  )
}
