import { useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useToast } from '../../components/Toast'
import { formatKobo } from '../../lib/format'
import { mockPortalSubscription, mockPortalInvoices } from '../../lib/mockData'

export default function Portal() {
  const { token } = useParams()
  const toast = useToast()
  const sub = mockPortalSubscription
  const invoices = mockPortalInvoices

  function handleUpdateCard() {
    toast.info('Card update redirects to Nomba checkout (activates Day 6)')
  }

  function handleCancel() {
    toast.warning('Cancel sets cancel-at-period-end — you keep access until the period ends')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-nomba-yellow font-black text-nomba-black text-sm">
              F
            </span>
            <span className="text-lg font-bold">FluxBill</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">Manage Your Subscription</h1>
          <p className="mt-1 text-sm text-neutral-500">View details, update payment method, or cancel your subscription.</p>
        </div>

        {/* Subscription card */}
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-neutral-500">{sub.customer}</p>
                <h2 className="text-xl font-bold">{sub.plan}</h2>
              </div>
              <StatusBadge status={sub.status} />
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoBlock label="Amount" value={formatKobo(sub.amount)} sublabel={`per month`} />
              <InfoBlock label="Next billing" value={formatDate(sub.next_billing_date)} />
              <InfoBlock label="Payment method" value={`•••• ${sub.card_last_four}`} sublabel="Visa" />
            </div>
          </div>

          <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleUpdateCard} className="btn-primary flex-1 sm:flex-initial">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Update card
              </button>
              <button onClick={handleCancel} className="btn-ghost flex-1 sm:flex-initial text-red-600 border-red-200 hover:bg-red-50">
                Cancel subscription
              </button>
            </div>
            <p className="mt-3 text-xs text-neutral-400">
              Cancellation takes effect at the end of your current billing period. Updating your card opens a secure Nomba checkout to re-tokenize.
            </p>
          </div>
        </div>

        {/* Invoice history */}
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="font-semibold">Invoice History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="px-6 py-3 font-medium">Invoice</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs">{inv.id}</td>
                    <td className="px-6 py-3 text-neutral-600">{formatDate(inv.date)}</td>
                    <td className="px-6 py-3 font-medium">{formatKobo(inv.amount)}</td>
                    <td className="px-6 py-3"><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-neutral-400">
          Secure portal powered by FluxBill
          {token && <span className="ml-1">· Token: {token.slice(0, 8)}…</span>}
        </p>
      </div>
    </div>
  )
}

function InfoBlock({ label, value, sublabel }) {
  return (
    <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-4">
      <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
      {sublabel && <p className="text-xs text-neutral-400">{sublabel}</p>}
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function CreditCardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  )
}
