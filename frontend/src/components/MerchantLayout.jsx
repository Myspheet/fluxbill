import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { clearToken, getToken } from '../lib/apiClient'

const navItem = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-nomba-yellow/10 text-nomba-black font-semibold border-l-[3px] border-nomba-yellow'
      : 'text-neutral-600 hover:bg-neutral-100 border-l-[3px] border-transparent'
  }`

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/plans/new', label: 'Create Plan', icon: PlanIcon },
  { to: '/admin/merchants', label: 'Admin', icon: AdminIcon },
]

export default function MerchantLayout({ children }) {
  const navigate = useNavigate()
  const authed = !!getToken()
  const [mobileOpen, setMobileOpen] = useState(false)

  function logout() {
    clearToken()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-neutral-200 bg-white">
        <div className="flex flex-col h-full">
          <div className="px-5 py-5">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-nomba-yellow font-black text-nomba-black text-sm">
                F
              </span>
              <span className="text-lg font-bold">FluxBill</span>
            </Link>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navItem}>
                <Icon />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-neutral-200 px-3 py-4">
            {authed ? (
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition">
                <LogoutIcon />
                Log out
              </button>
            ) : (
              <NavLink to="/login" className={navItem}>
                <LogoutIcon />
                Log in
              </NavLink>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-neutral-200 transition-transform duration-200 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-5">
            <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-nomba-yellow font-black text-nomba-black text-sm">
                F
              </span>
              <span className="text-lg font-bold">FluxBill</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100">
              <CloseIcon />
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navItem} onClick={() => setMobileOpen(false)}>
                <Icon />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-neutral-200 px-3 py-4">
            {authed ? (
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition">
                <LogoutIcon />
                Log out
              </button>
            ) : (
              <NavLink to="/login" className={navItem} onClick={() => setMobileOpen(false)}>
                <LogoutIcon />
                Log in
              </NavLink>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-neutral-100">
            <HamburgerIcon />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-nomba-yellow font-black text-nomba-black text-xs">
              F
            </span>
            <span className="text-base font-bold">FluxBill</span>
          </Link>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}

function DashboardIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  )
}

function PlanIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function AdminIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}
