function StatCard({ label, value, helper, tone = 'stone' }) {
  const toneClasses = {
    stone: 'border-stone-200 bg-white text-stone-950',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    amber: 'border-amber-200 bg-amber-50 text-amber-950',
    sky: 'border-sky-200 bg-sky-50 text-sky-950',
  }

  return (
    <article className={`rounded-lg border p-5 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.18em] opacity-60">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black">{value}</p>
      {helper && <p className="mt-2 text-sm font-medium opacity-65">{helper}</p>}
    </article>
  )
}

export default StatCard
