import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import MerchantLayout from '../../components/MerchantLayout'
import StatusBadge from '../../components/StatusBadge'
import api from '../../lib/apiClient'
import { formatKobo } from '../../lib/format'

export default function AdminMerchantDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('plans')

  useEffect(() => {
    api
      .get(`/admin/merchants/${id}`)
      .then(({ data: res }) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <MerchantLayout>
        <p className="text-sm text-neutral-500 mt-8">Loading merchant…</p>
      </MerchantLayout>
    )
  }

  if (error) {
    return (
      <MerchantLayout>
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </MerchantLayout>
    )
  }

  const { merchant, plans, customers, subscriptions, invoices } = data

  const TABS = [
    { key: 'plans', label: 'Plans', count: plans.length },
    { key: 'customers', label: 'Customers', count: customers.length },
    { key: 'subscriptions', label: 'Subscriptions', count: subscriptions.length },
    { key: 'invoices', label: 'Invoices', count: invoices.length },
  ]

  return (
    <MerchantLayout>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link to="/admin/merchants" className="hover:text-neutral-800">← All merchants</Link>
        <span>/</span>
        <span className="text-neutral-800 font-medium">{merchant.name}</span>
      </div>

      {/* Merchant header card */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-100 text-purple-700 text-xl font-bold">
                {merchant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold">{merchant.name}</h1>
                <p className="text-sm text-neutral-500">{merchant.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoChip label="Plans" value={plans.length} />
            <InfoChip label="Customers" value={customers.length} />
            <InfoChip label="Subscriptions" value={subscriptions.length} />
            <InfoChip label="Invoices" value={invoices.length} />
          </div>
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label="Fee model" value={merchant.fee_billing_model} />
          <InfoRow label="Fee rate" value={`${(merchant.fee_rate / 100).toFixed(2)}%`} />
          <InfoRow label="Webhook URL" value={merchant.webhook_url || '—'} />
          <InfoRow
            label="Nomba sub-account"
            value={merchant.nomba_sub_account_id || <span className="text-neutral-400 italic">Not linked yet</span>}
          />
          <InfoRow
            label="Registered"
            value={new Date(merchant.created_at).toLocaleDateString('en-NG', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          />
        </dl>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-neutral-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              tab === t.key
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {t.label}
            <span className="ml-1.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs font-semibold text-neutral-600">
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tab === 'plans' && (
        <TabTable
          columns={['Name', 'Amount', 'Interval', 'Trial days', 'Status']}
          rows={plans}
          renderRow={(p) => (
            <tr key={p.id} className="border-b border-neutral-100">
              <td className="py-3 pr-4 font-medium">{p.name}</td>
              <td className="py-3 pr-4">{formatKobo(p.amount)}</td>
              <td className="py-3 pr-4 capitalize">{p.interval}</td>
              <td className="py-3 pr-4">{p.trial_days}d</td>
              <td className="py-3"><StatusBadge status={p.status} /></td>
            </tr>
          )}
        />
      )}

      {tab === 'customers' && (
        <TabTable
          columns={['Name', 'Email', 'Phone', 'Nomba Customer ID']}
          rows={customers}
          renderRow={(c) => (
            <tr key={c.id} className="border-b border-neutral-100">
              <td className="py-3 pr-4 font-medium">{c.name}</td>
              <td className="py-3 pr-4 text-neutral-600">{c.email}</td>
              <td className="py-3 pr-4 text-neutral-600">{c.phone || '—'}</td>
              <td className="py-3 text-xs text-neutral-400">{c.nomba_customer_id || '—'}</td>
            </tr>
          )}
        />
      )}

      {tab === 'subscriptions' && (
        <TabTable
          columns={['Customer', 'Plan', 'Status', 'Current period end', 'Card last 4']}
          rows={subscriptions}
          renderRow={(s) => (
            <tr key={s.id} className="border-b border-neutral-100">
              <td className="py-3 pr-4 font-medium">{s.customer?.name || '—'}</td>
              <td className="py-3 pr-4">{s.plan?.name || '—'}</td>
              <td className="py-3 pr-4"><StatusBadge status={s.status} /></td>
              <td className="py-3 pr-4 text-sm text-neutral-500">
                {s.current_period_end
                  ? new Date(s.current_period_end).toLocaleDateString('en-NG')
                  : '—'}
              </td>
              <td className="py-3 text-xs text-neutral-400">{s.card_last_four ? `•••• ${s.card_last_four}` : '—'}</td>
            </tr>
          )}
        />
      )}

      {tab === 'invoices' && (
        <TabTable
          columns={['Reference', 'Customer', 'Amount', 'Status', 'Attempts', 'Date']}
          rows={invoices}
          renderRow={(inv) => (
            <tr key={inv.id} className="border-b border-neutral-100">
              <td className="py-3 pr-4 font-mono text-xs text-neutral-500">{inv.merchant_tx_ref || inv.id.slice(0, 8)}</td>
              <td className="py-3 pr-4">{inv.customer?.name || '—'}</td>
              <td className="py-3 pr-4">{formatKobo(inv.amount)}</td>
              <td className="py-3 pr-4"><StatusBadge status={inv.status} /></td>
              <td className="py-3 pr-4 text-center text-sm">{inv.attempt_count ?? 0}</td>
              <td className="py-3 text-xs text-neutral-500 whitespace-nowrap">
                {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-NG') : '—'}
              </td>
            </tr>
          )}
        />
      )}
    </MerchantLayout>
  )
}

function InfoChip({ label, value }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 font-medium text-neutral-800 truncate">{value}</dd>
    </div>
  )
}

function TabTable({ columns, rows, renderRow }) {
  if (rows.length === 0) {
    return (
      <div className="card py-12 text-center text-sm text-neutral-400">
        Nothing here yet.
      </div>
    )
  }
  return (
    <section className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            {columns.map((col) => (
              <th key={col} className="pb-2 pr-4 font-medium">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    </section>
  )
}
