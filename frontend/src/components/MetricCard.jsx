// A KPI card. `hero` paints the value in Nomba yellow — reserved for the
// recovered-revenue number, the hero feature deserving the hero colour.
export default function MetricCard({ label, value, sub, hero = false }) {
  return (
    <div className={`card ${hero ? 'border-nomba-yellow/60 ring-1 ring-nomba-yellow/40' : ''}`}>
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${hero ? 'text-nomba-black' : 'text-ink'}`}>
        {hero ? (
          <span className="rounded-md bg-nomba-yellow px-2 py-0.5">{value}</span>
        ) : (
          value
        )}
      </p>
      {sub && <p className="mt-1 text-sm text-neutral-500">{sub}</p>}
    </div>
  )
}
