import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

// Post-payment screen, shown only when "Subscribe as a group?" was selected.
// Repeatable name/email/phone form for each seat (Community Subscriptions).
export default function AddGroupMembers() {
  const { planId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const seats = Math.max(1, Number(params.get('seats')) || 2)

  const [members, setMembers] = useState(
    Array.from({ length: seats }, () => ({ name: '', email: '', phone: '' })),
  )

  function updateMember(i, k, v) {
    const next = [...members]
    next[i] = { ...next[i], [k]: v }
    setMembers(next)
  }

  return (
    <div className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-lg">
        <div className="card">
          <h1 className="text-xl font-bold">Add group members</h1>
          <p className="mt-1 text-sm text-neutral-500">
            You're paying for {seats} seats. Add each member below.
          </p>

          <div className="mt-5 space-y-4">
            {members.map((m, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 p-4">
                <p className="mb-2 text-sm font-semibold">Seat {i + 1}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    className="input"
                    placeholder="Name"
                    value={m.name}
                    onChange={(e) => updateMember(i, 'name', e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Email"
                    type="email"
                    value={m.email}
                    onChange={(e) => updateMember(i, 'email', e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Phone"
                    value={m.phone}
                    onChange={(e) => updateMember(i, 'phone', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(`/payment/return?ref=demo_group_${planId}`)}
            className="mt-5 w-full btn-primary"
          >
            Save members
          </button>
        </div>
      </div>
    </div>
  )
}
