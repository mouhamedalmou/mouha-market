function EmptyState({ title, message }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
      <h2 className="text-xl font-black text-stone-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-500">
        {message}
      </p>
    </div>
  )
}

export default EmptyState
