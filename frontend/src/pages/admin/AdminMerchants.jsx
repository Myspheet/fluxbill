import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MerchantLayout from '../../components/MerchantLayout'
import MetricCard from '../../components/MetricCard'
import StatusBadge from '../../components/StatusBadge'
import api from '../../lib/apiClient'

export default function AdminMerchants() {
  const [merchants, setMerchants] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/admin/merchants'),
      api.get('/admin/summary'),
    ])
      .then(([merchantsRes, summaryRes]) => {
        setMerchants(merchantsRes.data.data || [])
        setSummary(summaryRes.data.data || null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <MerchantLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-600 text-white text-xs font-bold">
            A
          </span>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-sm text-neutral-500">Platform-wide overview of all registered merchants.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Platform summary cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard label="Total merchants" value={summary.total_merchants} hero />
          <MetricCard label="Total plans" value={summary.total_plans} />
          <MetricCard label="Total customers" value={summary.total_customers} />
          <MetricCard label="Total subscriptions" value={summary.total_subscriptions} />
        </div>
      )}

      {/* Merchants table */}
      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">All merchants</h2>
        {loading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : merchants.length === 0 ? (
          <p className="text-sm text-neutral-500">No merchants registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="pb-2 pr-4">Merchant</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4 text-center">Plans</th>
                  <th className="pb-2 pr-4 text-center">Customers</th>
                  <th className="pb-2 pr-4 text-center">Subscriptions</th>
                  <th className="pb-2 pr-4">Nomba ID</th>
                  <th className="pb-2 pr-4">Registered</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m) => (
                  <tr key={m.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="py-3 pr-4 font-medium">
                      <Link to={`/admin/merchants/${m.id}`} className="hover:text-purple-700 hover:underline">
                        {m.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-neutral-600">{m.email}</td>
                    <td className="py-3 pr-4 text-center">
                      <CountBadge count={m.plans_count} />
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <CountBadge count={m.customers_count} />
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <CountBadge count={m.subscriptions_count} />
                    </td>
                    <td className="py-3 pr-4">
                      {m.nomba_sub_account_id ? (
                        <StatusBadge status="active" />
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-neutral-500 text-xs whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3">
                      <Link
                        to={`/admin/merchants/${m.id}`}
                        className="text-xs font-medium text-purple-600 hover:text-purple-800"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </MerchantLayout>
  )
}

function CountBadge({ count }) {
  return (
    <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-neutral-100 px-2 text-xs font-semibold text-neutral-700">
      {count}
    </span>
  )
}
