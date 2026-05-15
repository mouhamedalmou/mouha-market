import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmModal from '../../components/admin/ConfirmModal'
import EmptyState from '../../components/admin/EmptyState'
import LoadingSpinner from '../../components/admin/LoadingSpinner'
import Toast from '../../components/admin/Toast'
import api from '../../services/api'
import { formatCurrency } from '../../utils/formatters'

const PAGE_SIZE = 8

function PaginationControls({ page, totalPages, totalItems, onPrevious, onNext }) {
  return (
    <div className="grid min-w-0 grid-cols-[1fr_auto] items-center gap-2 border-t border-stone-200 px-2.5 py-2 sm:px-4 sm:py-2.5">
      <p className="min-w-0 truncate text-xs font-semibold text-stone-500 sm:text-sm">
        {page}/{totalPages} · {totalItems} prodotti
      </p>
      <div className="flex min-w-0 gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={onPrevious}
          className="min-h-8 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-black text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-9 sm:px-3 sm:py-1.5"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page === totalPages}
          onClick={onNext}
          className="min-h-8 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-black text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-9 sm:px-3 sm:py-1.5"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function ProductMobileCard({ product, onEdit, onDelete }) {
  return (
    <article className="w-full min-w-0 max-w-full rounded-2xl border border-stone-200/80 bg-white p-2.5 shadow-sm">
      <div className="grid min-w-0 grid-cols-[72px_1fr] gap-3">
        <img
          src={product.image || 'https://via.placeholder.com/96?text=No+Image'}
          alt={product.title}
          className="h-16 w-16 rounded-xl object-cover"
        />

        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-black leading-snug text-stone-950">
            {product.title}
          </p>
          <p className="mt-1 line-clamp-1 text-xs font-medium text-stone-500">
            {product.description}
          </p>
          <span className="mt-2 inline-flex max-w-full rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-stone-700">
            <span className="truncate">{product.category}</span>
          </span>
        </div>
      </div>

      <div className="mt-2 grid min-w-0 grid-cols-2 gap-1.5 rounded-2xl bg-stone-50 p-2 ring-1 ring-stone-100">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
            Prezzo
          </p>
          <p className="mt-0.5 truncate text-sm font-black text-emerald-700">
            {formatCurrency(product.price)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
            Stock
          </p>
          <p className="mt-0.5 truncate text-sm font-black text-stone-950">
            {product.stock}
          </p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={onEdit}
          className="min-h-8 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-black text-stone-700 transition hover:bg-stone-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="min-h-8 rounded-full bg-red-50 px-2.5 py-1 text-xs font-black text-red-700 transition hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </article>
  )
}

function createEmptyProduct() {
  return {
    title: '',
    description: '',
    price: '',
    stock: '',
    category: 'general',
    image: '',
  }
}

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState(createEmptyProduct)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/products')
      setProducts(res.data)
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Errore nel recupero prodotti',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return products
    }

    return products.filter(product =>
      `${product.title} ${product.category}`.toLowerCase().includes(normalizedSearch)
    )
  }, [products, search])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openCreateModal = () => {
    setEditingProduct(null)
    setProductForm(createEmptyProduct())
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setProductForm({
      title: product.title || '',
      description: product.description || '',
      price: product.price ?? '',
      stock: product.stock ?? '',
      category: product.category || 'general',
      image: product.image || '',
    })
    setModalOpen(true)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setProductForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
    }

    try {
      setSaving(true)

      if (editingProduct) {
        const res = await api.put(`/admin/products/${editingProduct._id}`, payload)
        setProducts(prev =>
          prev.map(product => (product._id === editingProduct._id ? res.data : product))
        )
        setToast({ type: 'success', message: 'Prodotto aggiornato' })
      } else {
        const res = await api.post('/admin/products', payload)
        setProducts(prev => [res.data, ...prev])
        setToast({ type: 'success', message: 'Prodotto aggiunto' })
      }

      setModalOpen(false)
      setEditingProduct(null)
      setProductForm(createEmptyProduct())
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Errore salvataggio prodotto',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      setDeleting(true)
      await api.delete(`/admin/products/${deleteTarget._id}`)
      setProducts(prev => prev.filter(product => product._id !== deleteTarget._id))
      setDeleteTarget(null)
      setToast({ type: 'success', message: 'Prodotto eliminato' })
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Errore eliminazione prodotto',
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner label="Caricamento prodotti..." />
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-x-hidden">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
            Products
          </p>
          <h1 className="mt-1 text-2xl font-black text-stone-950 sm:mt-2 sm:text-3xl">
            Gestione prodotti
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 sm:min-h-11 sm:px-5 sm:py-2.5"
        >
          Add product
        </button>
      </section>

      <section className="rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_12px_35px_rgba(28,25,23,0.05)] sm:rounded-3xl sm:p-4">
        <input
          type="search"
          value={search}
          onChange={event => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Search prodotti o categorie"
          className="min-h-10 w-full min-w-0 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
        />
      </section>

      {filteredProducts.length === 0 ? (
        <EmptyState
          title="Nessun prodotto trovato"
          message="Aggiungi un prodotto o modifica la ricerca."
        />
      ) : (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_14px_45px_rgba(28,25,23,0.07)] sm:rounded-3xl">
          <div className="grid min-w-0 gap-2 p-2 md:hidden">
            {paginatedProducts.map(product => (
              <ProductMobileCard
                key={product._id}
                product={product}
                onEdit={() => openEditModal(product)}
                onDelete={() => setDeleteTarget(product)}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-stone-200 text-sm">
              <thead className="bg-stone-50 text-left text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedProducts.map(product => (
                  <tr key={product._id} className="align-middle">
                    <td className="px-4 py-3">
                      <img
                        src={product.image || 'https://via.placeholder.com/80?text=No+Image'}
                        alt={product.title}
                        className="h-14 w-16 rounded-2xl object-cover"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-black text-stone-950">{product.title}</p>
                      <p className="line-clamp-1 max-w-xs text-xs text-stone-500">
                        {product.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-black text-emerald-700">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3 font-bold text-stone-700">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] text-stone-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="rounded-full border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-stone-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-full bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            onPrevious={() => setPage(prev => Math.max(1, prev - 1))}
            onNext={() => setPage(prev => Math.min(totalPages, prev + 1))}
          />
        </section>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-x-hidden bg-stone-950/60 px-3 backdrop-blur-sm sm:px-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-2xl min-w-0 overflow-y-auto rounded-2xl bg-white p-4 shadow-[0_24px_90px_rgba(28,25,23,0.28)] sm:rounded-3xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                  {editingProduct ? 'Edit product' : 'Add product'}
                </p>
                <h2 className="mt-1 text-xl font-black text-stone-950 sm:text-2xl">
                  {editingProduct ? 'Modifica prodotto' : 'Nuovo prodotto'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="min-h-10 rounded-full border border-stone-200 px-3 py-2 text-sm font-bold text-stone-700 disabled:opacity-50"
                aria-label="Chiudi form prodotto"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold text-stone-700">
                Nome
                <input
                  name="title"
                  value={productForm.title}
                  onChange={handleFormChange}
                  required
                  className="mt-2 min-h-12 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label className="text-sm font-bold text-stone-700">
                Categoria
                <input
                  name="category"
                  value={productForm.category}
                  onChange={handleFormChange}
                  required
                  className="mt-2 min-h-12 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label className="text-sm font-bold text-stone-700">
                Prezzo
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={handleFormChange}
                  required
                  className="mt-2 min-h-12 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label className="text-sm font-bold text-stone-700">
                Stock
                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={productForm.stock}
                  onChange={handleFormChange}
                  required
                  className="mt-2 min-h-12 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-bold text-stone-700">
              Immagine
              <input
                name="image"
                type="url"
                value={productForm.image}
                onChange={handleFormChange}
                placeholder="https://..."
                className="mt-2 min-h-12 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <label className="mt-4 block text-sm font-bold text-stone-700">
              Descrizione
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleFormChange}
                required
                rows="4"
                className="mt-2 w-full resize-none rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="min-h-11 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 rounded-full bg-stone-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Salvataggio...' : 'Salva prodotto'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Eliminare prodotto?"
        message={`Il prodotto ${deleteTarget?.title || ''} verrà rimosso dal catalogo.`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteProduct}
      />
    </div>
  )
}

export default AdminProducts
