import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MerchantLayout from '../../components/MerchantLayout'
import MetricCard from '../../components/MetricCard'
import StatusBadge from '../../components/StatusBadge'
import api from '../../lib/apiClient'
import { formatKobo, formatKoboShort } from '../../lib/format'
import {
  mockDashboardSummary,
  mockChurnRisks,
  mockBusinessModelProjection,
} from '../../lib/mockData'

export default function Dashboard() {
  const [plans, setPlans] = useState([])
  const [merchant, setMerchant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Live, pre-window-safe data: the merchant's own plans.
  useEffect(() => {
    Promise.all([
      api.get('/plans'),
      api.get('/auth/me')
    ])
      .then(([plansRes, meRes]) => {
        setPlans(plansRes.data.data || [])
        setMerchant(meRes.data.data || meRes.data || null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const s = mockDashboardSummary
  const storefrontUrl = merchant ? `${window.location.origin}/store/${merchant.id}` : ''

  return (
    <MerchantLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-neutral-500">Recovery-first view of your recurring revenue.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {merchant && (
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm text-neutral-600">
              <span className="font-semibold text-neutral-700">Storefront:</span>
              <a href={`/store/${merchant.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-purple-700 underline truncate max-w-[200px] sm:max-w-xs">
                View Storefront ↗
              </a>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(storefrontUrl)
                  alert('Storefront link copied to clipboard!')
                }}
                className="ml-1 text-xs text-purple-600 hover:text-purple-800 font-semibold"
              >
                Copy Link
              </button>
            </div>
          )}
          <Link to="/plans/new" className="btn-primary">
            + Create plan
          </Link>
        </div>
      </div>

      {/* Metrics — the hero "recovered revenue" number in Nomba yellow. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Recovered revenue (this month)"
          value={formatKoboShort(s.recovered_revenue_kobo)}
          sub={`${s.recovery_rate_pct}% of failed charges recovered`}
          hero
        />
        <MetricCard label="MRR" value={formatKoboShort(s.mrr_kobo)} sub="Monthly recurring revenue" />
        <MetricCard label="Active subscriptions" value={s.active_subscriptions} />
        <MetricCard label="Past due" value={s.past_due} sub="In dunning" />
      </div>
      <MockNote>Metrics use sample data until the Nomba billing window (1–7 July).</MockNote>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Plans (LIVE) */}
        <section className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your plans</h2>
            <span className="text-xs font-medium text-green-700">● live data</span>
          </div>
          {loading ? (
            <p className="text-sm text-neutral-500">Loading…</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : plans.length === 0 ? (
            <EmptyPlans />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="pb-2">Plan</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Interval</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Subscribe link</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100">
                    <td className="py-2 font-medium">{p.name}</td>
                    <td className="py-2">{formatKobo(p.amount)}</td>
                    <td className="py-2 capitalize">{p.interval}</td>
                    <td className="py-2">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-2">
                      <CopyLink url={p.subscribe_url} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Business-model projection (MOCK) */}
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold">Business model</h2>
          <p className="text-sm text-neutral-500">Simulated fee projection ({mockBusinessModelProjection.fee_rate_label}).</p>
          <dl className="mt-4 space-y-3 text-sm">
            <Row k="Monthly volume" v={formatKobo(mockBusinessModelProjection.monthly_volume_kobo)} />
            <Row k="Projected monthly fee" v={formatKobo(mockBusinessModelProjection.projected_monthly_fee_kobo)} />
            <Row k="Projected annual fee" v={formatKobo(mockBusinessModelProjection.projected_annual_fee_kobo)} />
          </dl>
          <MockNote>Simulated</MockNote>
        </section>
      </div>

      {/* Churn-risk + recovery copilot (MOCK) */}
      <section className="card mt-6">
        <h2 className="mb-1 text-lg font-semibold">Churn risk & recovery copilot</h2>
        <p className="mb-4 text-sm text-neutral-500">
          AI scores each subscription and recommends a concrete recovery action with expected revenue.
        </p>
        <div className="space-y-3">
          {mockChurnRisks.map((c) => (
            <ChurnRow key={c.subscription_id} c={c} />
          ))}
        </div>
        <MockNote>AI module ships 5 July; sample recommendations shown.</MockNote>
      </section>
    </MerchantLayout>
  )
}

function ChurnRow({ c }) {
  const ring =
    c.risk === 'high' ? 'border-red-200' : c.risk === 'medium' ? 'border-amber-200' : 'border-neutral-200'
  return (
    <div className={`rounded-xl border ${ring} p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">
            {c.customer} <span className="font-normal text-neutral-500">· {c.plan}</span>
          </p>
          <p className="mt-0.5 text-sm text-neutral-600">{c.reason}</p>
        </div>
        <RiskPill risk={c.risk} score={c.score} />
      </div>
      {c.risk !== 'low' && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm">
          <span>
            <strong className="text-red-700">{formatKoboShort(c.at_risk_kobo)} at risk.</strong>{' '}
            {c.recommendation}
          </span>
          <span className="font-semibold text-green-700">
            +{formatKoboShort(c.expected_recovery_kobo)} expected
          </span>
        </div>
      )}
      <div className="mt-3">
        <ManageSubscriptionButton subscriptionId={c.subscription_id} />
      </div>
    </div>
  )
}

function RiskPill({ risk, score }) {
  const cls =
    risk === 'high'
      ? 'bg-red-100 text-red-800'
      : risk === 'medium'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-green-100 text-green-800'
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${cls}`}>
      {risk} · {score}
    </span>
  )
}

// Generates a customer "Manage subscription" portal link. The real call is
// POST /api/portal/generate (IN-WINDOW, Day 6); shown here as a static demo.
function ManageSubscriptionButton({ subscriptionId }) {
  const [link, setLink] = useState(null)
  function generate() {
    setLink(`${window.location.origin}/portal/demo-${subscriptionId}-${Math.random().toString(36).slice(2, 10)}`)
  }
  return link ? (
    <CopyLink url={link} />
  ) : (
    <button onClick={generate} className="btn-ghost py-1.5 text-sm">
      Generate manage-subscription link
    </button>
  )
}

function CopyLink({ url }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="max-w-[14rem] truncate rounded border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50">
      {copied ? 'Copied ✓' : url}
    </button>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-neutral-500">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  )
}

function EmptyPlans() {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center">
      <p className="text-sm text-neutral-500">No plans yet.</p>
      <Link to="/plans/new" className="mt-3 inline-block btn-primary">
        Create your first plan
      </Link>
    </div>
  )
}

function MockNote({ children }) {
  return <p className="mt-3 text-xs italic text-neutral-400">{children}</p>
}
