// Semantic status colours (docs/10): green=paid/active, red=failed/suspended,
// amber=past_due/grace. Brand yellow is reserved for the hero metric, not status.
const STYLES = {
  active: 'bg-green-100 text-green-800',
  paid: 'bg-green-100 text-green-800',
  recovered: 'bg-green-100 text-green-800',
  trialing: 'bg-blue-100 text-blue-800',
  past_due: 'bg-amber-100 text-amber-800',
  grace_period: 'bg-amber-100 text-amber-800',
  partially_paid: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  access_suspended: 'bg-red-100 text-red-800',
  cancelled: 'bg-neutral-200 text-neutral-700',
  expired: 'bg-neutral-200 text-neutral-700',
  archived: 'bg-neutral-200 text-neutral-700',
}

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || 'bg-neutral-100 text-neutral-700'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {String(status || '').replace(/_/g, ' ')}
    </span>
  )
}
