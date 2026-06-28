import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

// The callbackUrl target after Nomba's hosted checkout. It polls
// GET /api/subscriptions/checkout/{merchant_tx_ref}/status — the webhook is the
// source of truth, this page only displays it. That endpoint is IN-WINDOW
// (Day 2), so here we simulate the polling -> success transition.
export default function PaymentReturn() {
  const [params] = useSearchParams()
  const ref = params.get('ref') || 'inv_preview'
  const [status, setStatus] = useState('pending')

  useEffect(() => {
    const t = setTimeout(() => setStatus('active'), 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-md text-center">
        <div className="card">
          {status === 'pending' ? (
            <>
              <Spinner />
              <h1 className="mt-4 text-xl font-bold">Confirming your payment…</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Checking status for <code>{ref}</code>
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-2xl">
                ✓
              </div>
              <h1 className="mt-4 text-xl font-bold">Subscription active!</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Your payment was confirmed and your subscription is now active.
              </p>
              <Link to="/dashboard" className="mt-6 inline-block btn-primary">
                Go to dashboard
              </Link>
            </>
          )}
          <p className="mt-4 text-xs italic text-neutral-400">
            Live status polling activates during the Nomba window (Day 2).
          </p>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-nomba-yellow" />
  )
}
