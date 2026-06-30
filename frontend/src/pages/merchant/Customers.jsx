import { useEffect, useState } from 'react'
import MerchantLayout from '../../components/MerchantLayout'
import StatusBadge from '../../components/StatusBadge'
import api from '../../lib/apiClient'
import { formatKobo } from '../../lib/format'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api
      .get('/customers')
      .then(({ data }) => setCustomers(data.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalCustomers = customers.length
  const totalActive = customers.reduce(
    (sum, c) => sum + c.subscriptions.filter((s) => s.status === 'active' || s.status === 'trialing').length,
    0
  )
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_paid_amount, 0)

  return (
    <MerchantLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-neutral-500">All customers who have subscribed to your plans.</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <SummaryCard label="Total Customers" value={totalCustomers} />
        <SummaryCard label="Active Subscriptions" value={totalActive} accent />
        <SummaryCard label="Total Revenue" value={formatKobo(totalRevenue)} />
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-sm"
        />
      </div>

      {/* Customer List */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-neutral-500 animate-pulse">Loading customers…</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-400 text-xl mb-3">
              👤
            </div>
            <p className="text-sm font-semibold text-neutral-700">
              {search ? 'No customers match your search' : 'No customers yet'}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              {search
                ? 'Try adjusting your search query.'
                : 'Customers will appear here once they subscribe via your storefront.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Subscriptions</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Invoices</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Total Paid</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <CustomerRow
                  key={c.id}
                  customer={c}
                  expanded={expandedId === c.id}
                  onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MerchantLayout>
  )
}

function CustomerRow({ customer, expanded, onToggle }) {
  const c = customer
  const activeCount = c.subscriptions.filter((s) => s.status === 'active' || s.status === 'trialing').length

  return (
    <>
      <tr
        onClick={onToggle}
        className={`border-b border-neutral-100 cursor-pointer transition hover:bg-neutral-50 ${
          expanded ? 'bg-nomba-yellow/5' : ''
        }`}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600 uppercase">
              {c.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-neutral-900 truncate">{c.name}</p>
              <p className="text-xs text-neutral-400 truncate">{c.email}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="font-semibold text-neutral-800">{c.subscriptions.length}</span>
          {activeCount > 0 && (
            <span className="ml-1.5 text-xs text-green-700 font-medium">({activeCount} active)</span>
          )}
        </td>
        <td className="px-4 py-3 hidden sm:table-cell text-neutral-600">{c.total_invoices_count}</td>
        <td className="px-4 py-3 hidden sm:table-cell font-medium text-neutral-800">
          {formatKobo(c.total_paid_amount)}
        </td>
        <td className="px-4 py-3 text-neutral-500 text-xs">
          {new Date(c.created_at).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </td>
      </tr>

      {/* Expanded subscription details */}
      {expanded && c.subscriptions.length > 0 && (
        <tr>
          <td colSpan={5} className="bg-neutral-50/80 px-4 py-4 border-b border-neutral-200">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-3">
              Subscription Details
            </p>
            <div className="space-y-3">
              {c.subscriptions.map((sub) => {
                const [portalUrl, setPortalUrl] = useState('')
                const [generating, setGenerating] = useState(false)

                const generateLink = (e) => {
                  e.stopPropagation()
                  setGenerating(true)
                  api.post('/portal/generate', { subscription_id: sub.id })
                    .then(({ data }) => {
                      setPortalUrl(data.portal_url)
                      navigator.clipboard.writeText(data.portal_url)
                      alert('Magic portal link generated and copied to clipboard!')
                    })
                    .catch((err) => alert(err.message))
                    .finally(() => setGenerating(false))
                }

                return (
                  <div
                    key={sub.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-neutral-200 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900 text-sm">{sub.plan_name || 'Unknown Plan'}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {formatKobo(sub.amount)} / {sub.interval}
                        {sub.card_last_four && (
                          <span className="ml-2 text-neutral-400">•••• {sub.card_last_four}</span>
                        )}
                      </p>
                      {portalUrl && (
                        <p className="text-xs text-purple-700 font-medium underline mt-1 select-all">
                          {portalUrl}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {sub.current_period_end && (
                        <span className="text-xs text-neutral-400">
                          Renews{' '}
                          {new Date(sub.current_period_end).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}
                      <StatusBadge status={sub.status} />
                      <button
                        onClick={generateLink}
                        disabled={generating}
                        className="btn-ghost border border-neutral-200 text-xs px-2.5 py-1.5 rounded-lg font-semibold hover:bg-neutral-50"
                      >
                        {generating ? 'Generating…' : portalUrl ? 'Copy Again' : 'Generate Link'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </td>
        </tr>
      )}

      {expanded && c.subscriptions.length === 0 && (
        <tr>
          <td colSpan={5} className="bg-neutral-50/80 px-4 py-4 border-b border-neutral-200 text-sm text-neutral-400 italic">
            No active subscriptions for this customer.
          </td>
        </tr>
      )}
    </>
  )
}

function SummaryCard({ label, value, accent }) {
  return (
    <div className="card">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent ? 'text-green-700' : 'text-neutral-900'}`}>
        {value}
      </p>
    </div>
  )
}
