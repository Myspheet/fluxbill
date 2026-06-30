import { useEffect, useState } from 'react'
import MerchantLayout from '../../components/MerchantLayout'
import { Select, DateInput } from '../../components/FormInputs'
import MetricCard from '../../components/MetricCard'
import StatusBadge from '../../components/StatusBadge'
import api from '../../lib/apiClient'
import { formatKobo } from '../../lib/format'
import { mockAdminReportsData } from '../../lib/mockData'

export default function AdminReports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    merchant: '',
    status: '',
    plan: '',
    customer: '',
  })

  useEffect(() => {
    fetchReports()
  }, [])

  function fetchReports() {
    setLoading(true)
    const params = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })

    api
      .get('/admin/reports', { params })
      .then(({ data: res }) => setData(res.data))
      .catch(() => {
        setData(mockAdminReportsData)
      })
      .finally(() => setLoading(false))
  }

  function applyFilters(e) {
    e.preventDefault()
    fetchReports()
  }

  function clearFilters() {
    setFilters({ date_from: '', date_to: '', merchant: '', status: '', plan: '', customer: '' })
  }

  const updateFilter = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })

  return (
    <MerchantLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-600 text-white text-xs font-bold">
            A
          </span>
          <h1 className="text-xl font-bold sm:text-2xl">Admin Reports</h1>
        </div>
        <p className="text-sm text-neutral-500">Platform-wide subscription and payment reports.</p>
      </div>

      {/* Filters */}
      <form onSubmit={applyFilters} className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-neutral-700">Filters</h2>
          <button type="button" onClick={clearFilters} className="text-xs text-neutral-500 hover:text-neutral-800">
            Clear all
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DateInput
            label="From"
            value={filters.date_from}
            onChange={(val) => setFilters({ ...filters, date_from: val })}
            placeholder="Start date"
          />
          <DateInput
            label="To"
            value={filters.date_to}
            onChange={(val) => setFilters({ ...filters, date_to: val })}
            placeholder="End date"
          />
          <div>
            <label className="label">Merchant</label>
            <input className="input" placeholder="Merchant name or ID" value={filters.merchant} onChange={updateFilter('merchant')} />
          </div>
          <Select
            label="Status"
            value={filters.status}
            onChange={(val) => setFilters({ ...filters, status: val })}
            placeholder="All statuses"
            options={[
              { value: 'paid', label: 'Paid' },
              { value: 'failed', label: 'Failed' },
              { value: 'recovered', label: 'Recovered' },
              { value: 'partially_paid', label: 'Partially paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'refunded', label: 'Refunded' },
            ]}
          />
          <div>
            <label className="label">Plan</label>
            <input className="input" placeholder="Plan name" value={filters.plan} onChange={updateFilter('plan')} />
          </div>
          <div>
            <label className="label">Customer</label>
            <input className="input" placeholder="Customer name or email" value={filters.customer} onChange={updateFilter('customer')} />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="btn-primary text-sm py-2">Apply filters</button>
        </div>
      </form>

      {loading ? (
        <div className="card py-12 text-center text-sm text-neutral-500">Loading reports…</div>
      ) : data ? (
        <>
          {/* Summary metrics */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricCard label="Platform revenue" value={formatKobo(data.summary.platform_revenue_kobo)} hero />
            <MetricCard label="Total transactions" value={data.summary.total_transactions} />
            <MetricCard label="Active merchants" value={data.summary.active_merchants} />
            <MetricCard label="Recovery rate" value={`${data.summary.recovery_rate_pct}%`} />
          </div>

          {/* Breakdown by merchant */}
          {data.merchant_breakdown && data.merchant_breakdown.length > 0 && (
            <div className="card mb-6 overflow-hidden p-0">
              <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                <h2 className="text-sm font-semibold text-neutral-700">Revenue by Merchant</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left text-neutral-500">
                      <th className="px-4 py-3 font-medium">Merchant</th>
                      <th className="px-4 py-3 font-medium">Revenue</th>
                      <th className="px-4 py-3 font-medium">Transactions</th>
                      <th className="px-4 py-3 font-medium">Recovery %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.merchant_breakdown.map((m) => (
                      <tr key={m.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 font-medium">{m.name}</td>
                        <td className="px-4 py-3">{formatKobo(m.revenue_kobo)}</td>
                        <td className="px-4 py-3 text-neutral-600">{m.transactions}</td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${m.recovery_pct >= 70 ? 'text-green-700' : m.recovery_pct >= 40 ? 'text-amber-700' : 'text-red-700'}`}>
                            {m.recovery_pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All transactions */}
          <div className="card overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
              <h2 className="text-sm font-semibold text-neutral-700">
                All Transactions ({data.transactions.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Merchant</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                        No transactions match your filters.
                      </td>
                    </tr>
                  ) : (
                    data.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-neutral-600">{tx.reference}</td>
                        <td className="px-4 py-3 text-neutral-700">{tx.merchant}</td>
                        <td className="px-4 py-3">{tx.customer}</td>
                        <td className="px-4 py-3 text-neutral-600">{tx.plan}</td>
                        <td className="px-4 py-3 font-medium">{formatKobo(tx.amount)}</td>
                        <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                        <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">{tx.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </MerchantLayout>
  )
}
