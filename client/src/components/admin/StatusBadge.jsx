const statusClasses = {
  pending: 'bg-orange-100 text-orange-800 ring-orange-200',
  preparing: 'bg-orange-100 text-orange-800 ring-orange-200',
  paid: 'bg-blue-100 text-blue-800 ring-blue-200',
  shipped: 'bg-blue-100 text-blue-800 ring-blue-200',
  ready: 'bg-blue-100 text-blue-800 ring-blue-200',
  delivered: 'bg-green-100 text-green-800 ring-green-200',
  admin: 'bg-stone-950 text-white ring-stone-950',
  user: 'bg-stone-100 text-stone-700 ring-stone-200',
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex max-w-full items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] ring-1 sm:text-xs sm:tracking-[0.12em] ${
        statusClasses[value] || 'bg-stone-100 text-stone-700 ring-stone-200'
      }`}
    >
      {value}
    </span>
  )
}

export default StatusBadge
