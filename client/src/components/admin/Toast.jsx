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
    <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className={`rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg ${toneClass}`}>
        <div className="flex items-start justify-between gap-4">
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none opacity-70 transition hover:opacity-100"
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
