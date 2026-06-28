import { Navigate, Route, Routes } from 'react-router-dom'
import { getToken } from './lib/apiClient'
import Register from './pages/merchant/Register'
import Login from './pages/merchant/Login'
import CreatePlan from './pages/merchant/CreatePlan'
import Dashboard from './pages/merchant/Dashboard'
import Subscribe from './pages/checkout/Subscribe'
import AddGroupMembers from './pages/checkout/AddGroupMembers'
import PaymentReturn from './pages/checkout/PaymentReturn'
import Portal from './pages/portal/Portal'

function Protected({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Merchant admin (Sanctum) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/plans/new"
        element={
          <Protected>
            <CreatePlan />
          </Protected>
        }
      />

      {/* Public customer-facing checkout */}
      <Route path="/subscribe/:planId" element={<Subscribe />} />
      <Route path="/subscribe/:planId/members" element={<AddGroupMembers />} />
      <Route path="/payment/return" element={<PaymentReturn />} />

      {/* Customer self-service portal (magic link) */}
      <Route path="/portal/:token" element={<Portal />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
