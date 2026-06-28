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
    <div className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-nomba-yellow font-black text-nomba-black">
            F
          </span>
          <span className="text-xl font-bold">FluxBill</span>
        </div>
        <div className="card">
          <h1 className="mb-5 text-xl font-bold">{title}</h1>
          {children}
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
