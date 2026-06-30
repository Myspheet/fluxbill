import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../lib/apiClient'

export default function PaymentReturn() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const ref = params.get('ref') || 'inv_preview'
  const [status, setStatus] = useState('pending')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (ref === 'demo_inv_preview' || ref === 'inv_preview') {
      const t = setTimeout(() => setStatus('active'), 1500)
      return () => clearTimeout(t)
    }

    let active = true
    let timer

    function checkStatus() {
      api.get(`/subscriptions/checkout/${ref}/status`)
        .then(({ data }) => {
          if (!active) return
          if (data.status === 'active') {
            setStatus('active')
            
            const queryParams = new URLSearchParams({
              ref: data.invoice.merchant_tx_ref,
              planName: data.metadata.planName,
              amount: data.metadata.amount,
              interval: data.metadata.interval,
              customerName: data.metadata.customerName,
              customerEmail: data.metadata.customerEmail,
              seats: data.metadata.seats,
              merchantName: data.metadata.merchantName,
            }).toString()

            setTimeout(() => {
              navigate(`/payment/success?${queryParams}`, { replace: true })
            }, 800)
          } else {
            timer = setTimeout(checkStatus, 2000)
          }
        })
        .catch((err) => {
          if (!active) return
          setError(err.message)
        })
    }

    checkStatus()

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [ref, navigate])

  return (
    <div className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-md text-center">
        <div className="card">
          {error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              <p className="font-bold">Check failed</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : status === 'pending' ? (
            <>
              <Spinner />
              <h1 className="mt-4 text-xl font-bold">Confirming your payment…</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Checking status for <code>{ref}</code>
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-2xl text-green-600">
                ✓
              </div>
              <h1 className="mt-4 text-xl font-bold">Subscription active!</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Your payment was confirmed and your subscription is now active.
              </p>
              <button onClick={() => navigate('/dashboard')} className="mt-6 inline-block btn-primary w-full">
                Go to dashboard
              </button>
            </>
          )}
          <p className="mt-4 text-xs italic text-neutral-400">
            Automated backend checkout simulation is active.
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
