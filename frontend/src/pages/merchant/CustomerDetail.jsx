import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import MerchantLayout from '../../components/MerchantLayout'
import StatusBadge from '../../components/StatusBadge'
import { useToast } from '../../components/Toast'
import api from '../../lib/apiClient'
import { formatKobo } from '../../lib/format'
import { mockCustomers, mockPortalInvoices } from '../../lib/mockData'

export default function CustomerDetail() {
  const { id } = useParams()
  const toast = useToast()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [portalLink, setPortalLink] = useState(null)
  const [generatingLink, setGeneratingLink] = useState(false)

  useEffect(() => {
    api
      .get(`/customers/${id}`)
      .then(({ data }) => setCustomer(data.data))
      .catch(() => {
        const mock = mockCustomers.find((c) => c.id === id) || mockCustomers[0]
        setCustomer({ ...mock, invoices: mockPortalInvoices })
      })
      .finally(() => setLoading(false))
  }, [id])

  async function generateLink() {
    setGeneratingLink(true)
    try {
      const { data } = await api.post(`/customers/${id}/portal-link`)
      setPortalLink(data.data?.url || data.data?.link)
      toast.success('Portal link generated')
    } catch {
      const demoLink = `${window.location.origin}/portal/demo-${id}-${Math.random().toString(36).slice(2, 10)}`
      setPortalLink(demoLink)
      toast.info('Demo portal link generated (live links activate Day 6)')
    } finally {
      setGeneratingLink(false)
    }
  }

  function copyLink() {
    if (portalLink) {
      navigator.clipboard?.writeText(portalLink)
      toast.success('Link copied to clipboard')
    }
  }

  if (loading) {
    return (
      <MerchantLayout>
        <div className="py-12 text-center text-sm text-neutral-500">Loading customer…</div>
      </MerchantLayout>
    )
  }

  if (!customer) {
    return (
      <MerchantLayout>
        <div className="py-12 text-center text-sm text-neutral-500">Customer not found.</div>
      </MerchantLayout>
    )
  }

  return (
    <MerchantLayout>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link to="/customers" className="hover:text-neutral-800">← All customers</Link>
        <span>/</span>
        <span className="text-neutral-800 font-medium">{customer.name}</span>
      </div>

      {/* Customer header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-nomba-yellow/20 text-xl font-bold text-nomba-black">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{customer.name}</h1>
              <p className="text-sm text-neutral-500">{customer.email}</p>
              {customer.phone && <p className="text-sm text-neutral-500">{customer.phone}</p>}
            </div>
          </div>
          <StatusBadge status={customer.status || 'active'} />
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Plan" value={customer.plan || '—'} />
          <InfoItem label="Subscribed since" value={customer.created_at ? new Date(customer.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
          <InfoItem label="Card" value={customer.card_last_four ? `•••• ${customer.card_last_four}` : '—'} />
          <InfoItem label="Total paid" value={customer.total_paid ? formatKobo(customer.total_paid) : '—'} />
        </dl>
      </div>

      {/* Generate Portal Link */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-semibold">Self-Service Portal Link</h2>
            <p className="text-sm text-neutral-500">
              Generate a secure link for this customer to manage their subscription.
            </p>
          </div>
          {!portalLink ? (
            <button
              onClick={generateLink}
              disabled={generatingLink}
              className="btn-primary whitespace-nowrap"
            >
              {generatingLink ? 'Generating…' : 'Generate Link'}
            </button>
          ) : (
            <button onClick={copyLink} className="btn-ghost whitespace-nowrap">
              Copy Link
            </button>
          )}
        </div>

        {portalLink && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <LinkIcon className="h-4 w-4 shrink-0 text-neutral-400" />
            <code className="flex-1 truncate text-sm text-neutral-700">{portalLink}</code>
            <button onClick={copyLink} className="shrink-0 text-xs font-medium text-nomba-black hover:text-nomba-yellow">
              Copy
            </button>
          </div>
        )}
      </div>

      {/* Invoice history */}
      <div className="card">
        <h2 className="mb-4 font-semibold">Invoice History</h2>
        {customer.invoices && customer.invoices.length > 0 ? (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="pb-2 font-medium">Invoice</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {customer.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-neutral-100">
                    <td className="py-2.5 font-mono text-xs">{inv.id}</td>
                    <td className="py-2.5 text-neutral-600">{inv.date || (inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-NG') : '—')}</td>
                    <td className="py-2.5">{formatKobo(inv.amount)}</td>
                    <td className="py-2.5"><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-neutral-500 py-8 text-center">No invoices yet.</p>
        )}
      </div>
    </MerchantLayout>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 font-medium text-neutral-800">{value}</dd>
    </div>
  )
}

function LinkIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  )
}
