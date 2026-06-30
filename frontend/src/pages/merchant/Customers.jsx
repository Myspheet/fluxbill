import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MerchantLayout from '../../components/MerchantLayout'
import StatusBadge from '../../components/StatusBadge'
import api from '../../lib/apiClient'
import { mockCustomers } from '../../lib/mockData'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api
      .get('/customers')
      .then(({ data }) => setCustomers(data.data || []))
      .catch(() => {
        setCustomers(mockCustomers)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <MerchantLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Customers</h1>
          <p className="text-sm text-neutral-500">View and manage your subscribers.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            className="input pl-9"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="card py-12 text-center text-sm text-neutral-500">Loading customers…</div>
      ) : filtered.length === 0 ? (
        <div className="card py-12 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-neutral-100">
            <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <p className="text-neutral-600 font-medium">
            {search ? 'No customers match your search' : 'No customers yet'}
          </p>
          <p className="mt-1 text-sm text-neutral-500">Customers appear here once they subscribe to one of your plans.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Since</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-ink">{c.name}</p>
                        <p className="text-xs text-neutral-500">{c.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{c.plan || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status || 'active'} />
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/customers/${c.id}`}
                        className="text-xs font-medium text-nomba-black hover:text-nomba-yellow transition"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MerchantLayout>
  )
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}
