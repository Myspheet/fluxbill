import { useSearchParams, Link } from 'react-router-dom'
import { formatKobo } from '../../lib/format'

export default function PaymentConfirmation() {
  const [params] = useSearchParams()
  
  const ref = params.get('ref') || 'TX_PREVIEW'
  const planName = params.get('planName') || 'Subscription Plan'
  const amount = Number(params.get('amount')) || 0
  const interval = params.get('interval') || 'monthly'
  const customerName = params.get('customerName') || 'Valued Customer'
  const customerEmail = params.get('customerEmail') || 'customer@example.com'
  const seats = Number(params.get('seats')) || 1
  const merchantName = params.get('merchantName') || 'Merchant'

  // Compute next billing date (e.g. today + 1 month or 1 year)
  const getNextBillingDate = () => {
    const d = new Date()
    if (interval === 'monthly') {
      d.setMonth(d.getMonth() + 1)
    } else if (interval === 'annual' || interval === 'yearly') {
      d.setFullYear(d.getFullYear() + 1)
    } else if (interval === 'weekly') {
      d.setDate(d.getDate() + 7)
    } else {
      d.setMonth(d.getMonth() + 1) // default monthly fallback
    }
    return d.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50 grid place-items-center py-12 px-6">
      <div className="w-full max-w-lg text-center">
        {/* Success Confetti Animation Anchor */}
        <div className="card shadow-lg p-8 sm:p-10 border border-neutral-200">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-600 text-3xl font-bold mb-6">
            ✓
          </div>
          
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Subscription Successful!</h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Thank you for your payment. Your subscription with <strong>{merchantName}</strong> is now active.
          </p>

          {/* Receipt/Details Box */}
          <div className="mt-8 bg-neutral-50 rounded-2xl border border-neutral-100 p-5 text-left space-y-4">
            <div className="flex justify-between items-start border-b border-neutral-200/60 pb-3">
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase">Plan Name</p>
                <p className="text-sm font-bold text-neutral-800 mt-0.5">{planName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400 font-semibold uppercase">Amount Paid</p>
                <p className="text-sm font-bold text-neutral-800 mt-0.5">
                  {formatKobo(amount)} <span className="text-xs font-normal text-neutral-500">/{interval}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase">Subscriber Name</p>
                <p className="text-sm font-medium text-neutral-800 mt-0.5 truncate">{customerName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase">Email Address</p>
                <p className="text-sm font-medium text-neutral-800 mt-0.5 truncate">{customerEmail}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-neutral-200/60 pt-3">
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase">Reference ID</p>
                <code className="text-xs font-mono font-bold text-neutral-700 bg-neutral-200/60 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                  {ref}
                </code>
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase">Seats</p>
                <p className="text-sm font-medium text-neutral-800 mt-0.5">
                  {seats} {seats > 1 ? 'licensed seats' : 'individual seat'}
                </p>
              </div>
            </div>

            <div className="bg-nomba-yellow/10 border border-nomba-yellow/20 rounded-xl p-3 text-center text-xs text-neutral-700 font-semibold">
              📅 Next renewal charge scheduled on {getNextBillingDate()}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to="/" className="flex-1 btn-ghost text-center py-3 text-sm font-bold border border-neutral-300 rounded-xl hover:bg-neutral-100 transition">
              Back to Homepage
            </Link>
            <button
              onClick={() => alert('Magic Link sent to email to access customer portal!')}
              className="flex-1 btn-primary py-3 text-sm font-bold rounded-xl shadow-lg shadow-nomba-yellow/10 transition"
            >
              Manage Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
