import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { setToken } from '../../lib/apiClient'
import { AuthShell, Field, ErrorBanner } from './Register'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login', form)
      console.log(data)
      setToken(data.token)
      navigate('/dashboard')
    } catch (err) {
      console.log(err.message)
      setError(err.message)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Log in to FluxBill">
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <Field label="Email">
          <input className="input" type="email" value={form.email} onChange={update('email')} required />
        </Field>
        <Field label="Password">
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={update('password')}
            required
          />
        </Field>
        <button disabled={loading} className="w-full btn-primary">
          {loading ? 'Logging in…' : 'Log in'}
        </button>
        <p className="text-center text-sm text-neutral-500">
          New to FluxBill?{' '}
          <Link to="/register" className="font-semibold text-ink underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
