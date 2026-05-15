function StatCard({ label, value, helper, tone = 'stone' }) {
  const toneClasses = {
    stone: 'border-white/80 bg-white/95 text-stone-950',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-950',
    amber: 'border-amber-100 bg-amber-50 text-amber-950',
    sky: 'border-sky-100 bg-sky-50 text-sky-950',
  }

  return (
    <article className={`rounded-3xl border p-5 shadow-[0_14px_45px_rgba(28,25,23,0.06)] ${toneClasses[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] opacity-60">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black">{value}</p>
      {helper && <p className="mt-2 text-sm font-medium opacity-65">{helper}</p>}
    </article>
  )
}

export default StatCard
