import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import api, { clearToken, getToken, getUser, setUser } from '../lib/apiClient'
import { ConfirmModal } from './Modal'
import { useToast } from './Toast'

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-nomba-yellow/10 text-nomba-black font-semibold border-l-[3px] border-nomba-yellow'
      : 'text-neutral-600 hover:bg-neutral-100 border-l-[3px] border-transparent'
  }`

const merchantLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/plans', label: 'Plan Management', icon: PlanIcon },
  { to: '/customers', label: 'Customers', icon: CustomersIcon },
  { to: '/reports', label: 'Reports', icon: ReportsIcon },
]

const adminLinks = [
  { to: '/admin/merchants', label: 'View Merchants', icon: MerchantsIcon },
  { to: '/admin/reports', label: 'Admin Reports', icon: ReportsIcon },
]

export default function MerchantLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const authed = !!getToken()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [user, setLocalUser] = useState(getUser)

  useEffect(() => {
    if (authed && !user) {
      api.get('/auth/me')
        .then(({ data }) => {
          const u = data.data || data.user || data
          setUser(u)
          setLocalUser(u)
        })
        .catch(() => {})
    }
  }, [authed, user])

  const isAdmin = !!user?.is_admin
  const isAdminSection = location.pathname.startsWith('/admin')
  const activeLinks = isAdminSection ? adminLinks : merchantLinks

  function logout() {
    clearToken()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const sidebarContent = (mobile = false) => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={mobile ? () => setMobileOpen(false) : undefined}>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-nomba-yellow font-black text-nomba-black text-sm">
            F
          </span>
          <span className="text-lg font-bold">FluxBill</span>
        </Link>
      </div>

      {/* Section label */}
      <div className="px-5 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          {isAdminSection ? 'Admin' : 'Merchant'}
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {activeLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navItemClass} onClick={mobile ? () => setMobileOpen(false) : undefined}>
            <Icon />
            {label}
          </NavLink>
        ))}

        {/* Switch section link — only show Admin Panel if user is admin */}
        {(isAdmin || isAdminSection) && (
          <div className="pt-4 mt-4 border-t border-neutral-100">
            <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {isAdminSection ? 'Merchant' : 'Admin'}
            </span>
            {isAdminSection ? (
              <NavLink to="/dashboard" className={navItemClass} onClick={mobile ? () => setMobileOpen(false) : undefined}>
                <DashboardIcon />
                Merchant Dashboard
              </NavLink>
            ) : (
              <NavLink to="/admin/merchants" className={navItemClass} onClick={mobile ? () => setMobileOpen(false) : undefined}>
                <AdminIcon />
                Admin Panel
              </NavLink>
            )}
          </div>
        )}
      </nav>

      <div className="border-t border-neutral-200 px-3 py-4">
        {authed ? (
          <button
            onClick={() => { if (mobile) setMobileOpen(false); setLogoutOpen(true) }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition"
          >
            <LogoutIcon />
            Log out
          </button>
        ) : (
          <NavLink to="/login" className={navItemClass} onClick={mobile ? () => setMobileOpen(false) : undefined}>
            <LogoutIcon />
            Log in
          </NavLink>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-neutral-200 bg-white">
        {sidebarContent(false)}
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

        <div className="px-5 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            {isAdminSection ? 'Admin' : 'Merchant'}
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {activeLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navItemClass} onClick={() => setMobileOpen(false)}>
              <Icon />
              {label}
            </NavLink>
          ))}

          {(isAdmin || isAdminSection) && (
            <div className="pt-4 mt-4 border-t border-neutral-100">
              <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {isAdminSection ? 'Merchant' : 'Admin'}
              </span>
              {isAdminSection ? (
                <NavLink to="/dashboard" className={navItemClass} onClick={() => setMobileOpen(false)}>
                  <DashboardIcon />
                  Merchant Dashboard
                </NavLink>
              ) : (
                <NavLink to="/admin/merchants" className={navItemClass} onClick={() => setMobileOpen(false)}>
                  <AdminIcon />
                  Admin Panel
                </NavLink>
              )}
            </div>
          )}
        </nav>

        <div className="border-t border-neutral-200 px-3 py-4">
          {authed ? (
            <button
              onClick={() => { setMobileOpen(false); setLogoutOpen(true) }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition"
            >
              <LogoutIcon />
              Log out
            </button>
          ) : (
            <NavLink to="/login" className={navItemClass} onClick={() => setMobileOpen(false)}>
              <LogoutIcon />
              Log in
            </NavLink>
          )}
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

      {/* Logout confirmation modal */}
      <ConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={logout}
        variant="danger"
        title="Log out of FluxBill?"
        message="You'll need to sign in again to access your dashboard and manage your subscriptions."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
      />
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

function CustomersIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}

function ReportsIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}

function MerchantsIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
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
