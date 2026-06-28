import { useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { formatKobo } from '../../lib/format'
import { mockPortalSubscription, mockPortalInvoices } from '../../lib/mockData'

// FluxBill-hosted customer self-service portal, reached via a signed single-use
// magic link (no password). The token resolves via GET /api/portal/{token}/...
// — those customer routes are IN-WINDOW (Day 6), so this renders sample data.
export default function Portal() {
  const { token } = useParams()
  const sub = mockPortalSubscription
  const invoices = mockPortalInvoices

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-nomba-yellow font-black text-nomba-black">
          F
        </span>
        <span className="text-lg font-bold">Manage your subscription</span>
      </div>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-500">{sub.customer}</p>
            <h1 className="text-xl font-bold">{sub.plan}</h1>
          </div>
          <StatusBadge status={sub.status} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-neutral-500">Amount</dt>
            <dd className="font-semibold">{formatKobo(sub.amount)}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Next billing date</dt>
            <dd className="font-semibold">{sub.next_billing_date}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Card</dt>
            <dd className="font-semibold">•••• {sub.card_last_four}</dd>
          </div>
        </dl>

        <div className="mt-6 flex gap-3">
          <button className="btn-primary">Update card</button>
          <button className="btn-ghost">Cancel subscription</button>
        </div>
        <p className="mt-2 text-xs text-neutral-400">
          "Cancel" sets cancel-at-period-end (you keep access until the period ends). "Update card"
          re-runs Nomba checkout to re-tokenize.
        </p>
      </div>

      <div className="card mt-6">
        <h2 className="mb-4 text-lg font-semibold">Invoice history</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="pb-2">Invoice</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-neutral-100">
                <td className="py-2 font-medium">{inv.id}</td>
                <td className="py-2">{inv.date}</td>
                <td className="py-2">{formatKobo(inv.amount)}</td>
                <td className="py-2">
                  <StatusBadge status={inv.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-xs italic text-neutral-400">
        Token {token ? `"${token.slice(0, 10)}…"` : ''} · live portal data activates Day 6.
      </p>
    </div>
  )
}
