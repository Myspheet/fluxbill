import { Link, NavLink, useNavigate } from 'react-router-dom'
import { clearToken, getToken } from '../lib/apiClient'

const navItem = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-nomba-yellow text-nomba-black' : 'text-neutral-600 hover:bg-neutral-100'
  }`

export default function MerchantLayout({ children }) {
  const navigate = useNavigate()
  const authed = !!getToken()

  function logout() {
    clearToken()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-nomba-yellow font-black text-nomba-black">
              F
            </span>
            <span className="text-lg font-bold">FluxBill</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/dashboard" className={navItem}>
              Dashboard
            </NavLink>
            <NavLink to="/plans/new" className={navItem}>
              Create Plan
            </NavLink>
            <NavLink to="/customers" className={navItem}>
              Customers
            </NavLink>
            <NavLink to="/admin/merchants" className={navItem}>
              Admin
            </NavLink>
            {authed ? (
              <button onClick={logout} className="ml-2 btn-ghost py-2 text-sm">
                Log out
              </button>
            ) : (
              <NavLink to="/login" className={navItem}>
                Log in
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
