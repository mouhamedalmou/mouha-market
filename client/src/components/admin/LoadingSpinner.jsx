function LoadingSpinner({ label = 'Caricamento...' }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-stone-200 bg-white p-8">
      <div className="flex items-center gap-3 text-sm font-semibold text-stone-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-emerald-600" />
        {label}
      </div>
    </div>
  )
}

export default LoadingSpinner
