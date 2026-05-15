import { useEffect } from 'react'

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timeoutId = window.setTimeout(onClose, 3500)
    return () => window.clearTimeout(timeoutId)
  }, [toast, onClose])

  if (!toast) {
    return null
  }

  const toneClass =
    toast.type === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800'

  return (
    <div className="fixed inset-x-4 top-4 z-50 mx-auto w-auto max-w-sm sm:inset-x-auto sm:right-4 sm:mx-0">
      <div className={`rounded-2xl border px-4 py-3 text-sm font-bold shadow-[0_18px_60px_rgba(28,25,23,0.16)] backdrop-blur ${toneClass}`}>
        <div className="flex items-start justify-between gap-4">
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-1 text-lg leading-none opacity-70 transition hover:opacity-100"
            aria-label="Chiudi notifica"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast
