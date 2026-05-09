const statusClasses = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  shipped: 'bg-sky-100 text-sky-800 ring-sky-200',
  delivered: 'bg-stone-950 text-white ring-stone-950',
  admin: 'bg-stone-950 text-white ring-stone-950',
  user: 'bg-stone-100 text-stone-700 ring-stone-200',
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] ring-1 ${
        statusClasses[value] || 'bg-stone-100 text-stone-700 ring-stone-200'
      }`}
    >
      {value}
    </span>
  )
}

export default StatusBadge
