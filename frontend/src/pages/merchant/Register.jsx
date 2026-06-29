import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { setToken } from '../../lib/apiClient'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', webhook_url: '' })
  const [error, setError] = useState(null)
  const [fieldErr, setFieldErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [secret, setSecret] = useState(null)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErr(null)
    try {
      const payload = { ...form }
      if (!payload.webhook_url) delete payload.webhook_url
      const { data } = await api.post('/merchants/register', payload)
      setToken(data.token)
      // webhook_secret is shown ONCE and never returned again.
      setSecret(data.webhook_secret)
    } catch (err) {
      setError(err.message)
      setFieldErr(err.field)
    } finally {
      setLoading(false)
    }
  }

  if (secret) {
    return (
      <AuthShell title="Save your webhook secret">
        <p className="text-sm text-neutral-600">
          This is the only time we'll show your <strong>webhook secret</strong>. Use it to verify the
          authenticity of FluxBill webhooks. Store it somewhere safe.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-neutral-900 px-4 py-3 text-sm text-nomba-yellow">
          {secret}
        </pre>
        <button onClick={() => navigate('/dashboard')} className="mt-6 w-full btn-primary">
          Continue to dashboard
        </button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your FluxBill account">
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <Field label="Business name" error={fieldErr === 'name' && error}>
          <input className="input" value={form.name} onChange={update('name')} required />
        </Field>
        <Field label="Email" error={fieldErr === 'email' && error}>
          <input className="input" type="email" value={form.email} onChange={update('email')} required />
        </Field>
        <Field label="Password" error={fieldErr === 'password' && error}>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={update('password')}
            required
          />
        </Field>
        <Field label="Webhook URL (optional)">
          <input
            className="input"
            type="url"
            placeholder="https://yourapp.com/webhooks/fluxbill"
            value={form.webhook_url}
            onChange={update('webhook_url')}
          />
        </Field>
        <button disabled={loading} className="w-full btn-primary">
          {loading ? 'Creating…' : 'Create account'}
        </button>
        <p className="text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}

export function AuthShell({ title, children }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-white text-ink">
      {/* Left Marketing Panel - Visible on large screens */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0d0e12] relative overflow-hidden flex-col justify-between p-12 text-white border-r border-neutral-900 select-none">
        {/* Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-nomba-yellow/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 relative z-10 self-start">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-nomba-yellow font-black text-nomba-black text-sm">
            F
          </span>
          <span className="text-xl font-bold tracking-tight text-white">FluxBill</span>
        </Link>

        {/* Big Text */}
        <div className="relative z-10 my-auto pr-8">
          <span className="text-nomba-yellow text-xs uppercase tracking-widest font-extrabold block mb-3">Designed for Nigeria</span>
          <h2 className="text-3xl font-black leading-tight text-white mb-6">
            The Revenue Recovery Layer for Subscriptions
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Isolate merchant funds with Nomba Sub-Accounts, deploy custom retry routers to fight failed cards or outages, and let customers self-serve.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-nomba-yellow text-lg font-bold">₦5B+</span>
              <span className="text-xs text-neutral-400">Total addressable market currently lost to failed payments.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-nomba-yellow text-lg font-bold">25%</span>
              <span className="text-xs text-neutral-400">Average subscription churn saved by our retry engine.</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-xs text-neutral-500 relative z-10">
          Powered by Nomba Sub-Accounts & Tokenized Cards
        </p>
      </div>

      {/* Right Form Panel */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-between bg-neutral-50 min-h-screen p-6 sm:p-12 relative">
        {/* Back to Home & Logo (mobile only) */}
        <div className="flex items-center justify-between w-full mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to home
          </Link>
          <Link to="/" className="flex lg:hidden items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded bg-nomba-yellow font-black text-nomba-black text-xs">
              F
            </span>
            <span className="text-base font-bold text-neutral-900">FluxBill</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="my-auto mx-auto w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm">
          <h1 className="mb-6 text-xl font-bold text-neutral-900 tracking-tight">{title}</h1>
          {children}
        </div>

        {/* Tiny footer */}
        <div className="mt-8 text-center lg:text-left text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} FluxBill. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function ErrorBanner({ children }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </div>
  )
}
