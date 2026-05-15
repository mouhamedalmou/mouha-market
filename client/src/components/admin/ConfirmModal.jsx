function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Elimina',
  cancelLabel = 'Annulla',
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_24px_90px_rgba(28,25,23,0.28)]">
        <h2 className="text-xl font-black text-stone-950">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">{message}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="min-h-11 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="min-h-11 rounded-full bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Attendere...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
