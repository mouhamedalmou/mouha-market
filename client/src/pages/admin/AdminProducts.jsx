import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmModal from '../../components/admin/ConfirmModal'
import EmptyState from '../../components/admin/EmptyState'
import LoadingSpinner from '../../components/admin/LoadingSpinner'
import Toast from '../../components/admin/Toast'
import api from '../../services/api'
import { formatCurrency } from '../../utils/formatters'

const PAGE_SIZE = 8

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
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
            Products
          </p>
          <h1 className="mt-2 text-3xl font-black text-stone-950">
            Gestione prodotti
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-stone-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          Add product
        </button>
      </section>

      <section className="rounded-3xl border border-white/80 bg-white/95 p-4 shadow-[0_14px_45px_rgba(28,25,23,0.06)]">
        <input
          type="search"
          value={search}
          onChange={event => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Search prodotti o categorie"
          className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </section>

      {filteredProducts.length === 0 ? (
        <EmptyState
          title="Nessun prodotto trovato"
          message="Aggiungi un prodotto o modifica la ricerca."
        />
      ) : (
        <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-[0_18px_60px_rgba(28,25,23,0.08)]">
          <div className="overflow-x-auto">
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

          <div className="flex flex-col gap-3 border-t border-stone-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-stone-500">
              Pagina {page} di {totalPages} · {filteredProducts.length} prodotti
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="min-h-10 rounded-full border border-stone-200 px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="min-h-10 rounded-full border border-stone-200 px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/60 px-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_24px_90px_rgba(28,25,23,0.28)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                  {editingProduct ? 'Edit product' : 'Add product'}
                </p>
                <h2 className="mt-1 text-2xl font-black text-stone-950">
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
    </>
  )
}

export default AdminProducts
