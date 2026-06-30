import { Navigate, Route, Routes } from 'react-router-dom'
import { getToken } from './lib/apiClient'
import Register from './pages/merchant/Register'
import Login from './pages/merchant/Login'
import Dashboard from './pages/merchant/Dashboard'
import Plans from './pages/merchant/Plans'
import Customers from './pages/merchant/Customers'
import CustomerDetail from './pages/merchant/CustomerDetail'
import Reports from './pages/merchant/Reports'
import Subscribe from './pages/checkout/Subscribe'
import Storefront from './pages/checkout/Storefront'
import AddGroupMembers from './pages/checkout/AddGroupMembers'
import PaymentReturn from './pages/checkout/PaymentReturn'
import PaymentConfirmation from './pages/checkout/PaymentConfirmation'
import Portal from './pages/portal/Portal'
import AdminMerchants from './pages/admin/AdminMerchants'
import AdminMerchantDetail from './pages/admin/AdminMerchantDetail'
import AdminReports from './pages/admin/AdminReports'
import Home from './pages/Home'

function Protected({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Merchant (protected) */}
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/plans" element={<Protected><Plans /></Protected>} />
      <Route path="/customers" element={<Protected><Customers /></Protected>} />
      <Route path="/customers/:id" element={<Protected><CustomerDetail /></Protected>} />
      <Route path="/reports" element={<Protected><Reports /></Protected>} />

      {/* Admin panel (protected) */}
      <Route path="/admin/merchants" element={<Protected><AdminMerchants /></Protected>} />
      <Route path="/admin/merchants/:id" element={<Protected><AdminMerchantDetail /></Protected>} />
      <Route path="/admin/reports" element={<Protected><AdminReports /></Protected>} />

      {/* Public customer-facing checkout */}
      <Route path="/store/:merchantId" element={<Storefront />} />
      <Route path="/subscribe/:planId" element={<Subscribe />} />
      <Route path="/subscribe/:planId/members" element={<AddGroupMembers />} />
      <Route path="/payment/return" element={<PaymentReturn />} />
      <Route path="/payment/confirmation" element={<PaymentConfirmation />} />

      {/* Customer self-service portal (magic link) */}
      <Route path="/portal/:token" element={<Portal />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
