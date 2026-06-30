import { useEffect, useState } from 'react'
import MerchantLayout from '../../components/MerchantLayout'
import { Select, DateInput } from '../../components/FormInputs'
import MetricCard from '../../components/MetricCard'
import StatusBadge from '../../components/StatusBadge'
import api from '../../lib/apiClient'
import { formatKobo } from '../../lib/format'
import { mockReportsData } from '../../lib/mockData'

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
    plan: '',
  })

  useEffect(() => {
    fetchReports()
  }, [])

  function fetchReports() {
    setLoading(true)
    const params = {}
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    if (filters.status) params.status = filters.status
    if (filters.plan) params.plan = filters.plan

    api
      .get('/reports', { params })
      .then(({ data: res }) => setData(res.data))
      .catch(() => {
        setData(mockReportsData)
      })
      .finally(() => setLoading(false))
  }

  function applyFilters(e) {
    e.preventDefault()
    fetchReports()
  }

  function clearFilters() {
    setFilters({ date_from: '', date_to: '', status: '', plan: '' })
  }

  const updateFilter = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })

  return (
    <MerchantLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold sm:text-2xl">Reports</h1>
        <p className="text-sm text-neutral-500">Subscription and payment activity reports.</p>
      </div>

      {/* Filters */}
      <form onSubmit={applyFilters} className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-neutral-700">Filters</h2>
          <button type="button" onClick={clearFilters} className="text-xs text-neutral-500 hover:text-neutral-800">
            Clear all
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            ]}
          />
          <div>
            <label className="label">Plan</label>
            <input className="input" placeholder="Plan name" value={filters.plan} onChange={updateFilter('plan')} />
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
            <MetricCard label="Total revenue" value={formatKobo(data.summary.total_revenue_kobo)} hero />
            <MetricCard label="Successful payments" value={data.summary.successful_payments} />
            <MetricCard label="Failed payments" value={data.summary.failed_payments} />
            <MetricCard label="Recovery rate" value={`${data.summary.recovery_rate_pct}%`} />
          </div>

          {/* Transactions table */}
          <div className="card overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
              <h2 className="text-sm font-semibold text-neutral-700">
                Transactions ({data.transactions.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="px-4 py-3 font-medium">Reference</th>
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
                      <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                        No transactions match your filters.
                      </td>
                    </tr>
                  ) : (
                    data.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-neutral-600">{tx.reference}</td>
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
