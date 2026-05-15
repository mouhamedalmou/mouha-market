function LoadingState({ label = 'Caricamento...', helper }) {
  return (
    <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(28,25,23,0.08)] backdrop-blur sm:p-8">
      <div className="flex items-center gap-3 text-sm font-bold text-stone-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-emerald-600" />
        <span>{label}</span>
      </div>
      {helper && <p className="mt-3 text-sm leading-6 text-stone-500">{helper}</p>}
    </section>
  )
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <section className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-sm"
        >
          <div className="aspect-[4/3] animate-pulse bg-stone-200" />
          <div className="space-y-4 p-5">
            <div className="h-4 w-24 animate-pulse rounded-full bg-stone-200" />
            <div className="h-6 w-3/4 animate-pulse rounded-full bg-stone-200" />
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded-full bg-stone-200" />
              <div className="h-3 w-5/6 animate-pulse rounded-full bg-stone-200" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="h-7 w-24 animate-pulse rounded-full bg-stone-200" />
              <div className="h-11 w-28 animate-pulse rounded-full bg-stone-200" />
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}

export default LoadingState
