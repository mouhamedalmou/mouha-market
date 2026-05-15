import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmModal from '../../components/admin/ConfirmModal'
import EmptyState from '../../components/admin/EmptyState'
import LoadingSpinner from '../../components/admin/LoadingSpinner'
import StatusBadge from '../../components/admin/StatusBadge'
import Toast from '../../components/admin/Toast'
import api from '../../services/api'
import { formatCurrency, formatOrderDate } from '../../utils/formatters'

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered']
const PAGE_SIZE = 8

function createEmptyManualOrder() {
  return {
    userId: '',
    status: 'pending',
    items: [{ productId: '', quantity: 1 }],
  }
}

function getOrderPieces(order) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

function PaginationControls({ page, totalPages, totalItems, onPrevious, onNext }) {
  return (
    <div className="grid min-w-0 grid-cols-[1fr_auto] items-center gap-2 border-t border-stone-200 px-2.5 py-2 sm:px-4 sm:py-2.5">
      <p className="min-w-0 truncate text-xs font-semibold text-stone-500 sm:text-sm">
        {page}/{totalPages} · {totalItems} ordini
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

function MobileOrderCard({ order, updatingStatusId, onView, onStatusChange, onDelete }) {
  return (
    <article className="w-full min-w-0 max-w-full rounded-2xl border border-stone-200/80 bg-white p-2.5 shadow-sm">
      <div className="min-w-0">
        <div className="min-w-0 border-b border-stone-100 pb-2">
          <p className="truncate text-xs font-black uppercase tracking-[0.12em] text-stone-400">
            #{order._id.slice(-8).toUpperCase()}
          </p>
          <p className="mt-1 truncate text-sm font-black text-stone-950">
            {order.user?.name || 'Cliente rimosso'}
          </p>
          <p className="truncate text-xs font-medium text-stone-500">
            {order.user?.email || 'Email non disponibile'}
          </p>
        </div>
        <div className="mt-2 flex max-w-full">
          <StatusBadge value={order.status} />
        </div>
      </div>

      <div className="mt-2 grid min-w-0 grid-cols-1 gap-1.5 rounded-2xl bg-stone-50 p-2 ring-1 ring-stone-100 min-[360px]:grid-cols-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
            Totale
          </p>
          <p className="mt-0.5 truncate text-sm font-black text-emerald-700">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
            Pezzi
          </p>
          <p className="mt-0.5 text-sm font-black text-stone-950">{getOrderPieces(order)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
            Data
          </p>
          <p className="mt-0.5 truncate text-xs font-bold text-stone-600">
            {formatOrderDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-2 grid min-w-0 grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={onView}
          className="min-h-8 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-black text-stone-700 transition hover:bg-stone-50"
        >
          View
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="min-h-8 rounded-full bg-red-50 px-2.5 py-1 text-xs font-black text-red-700 transition hover:bg-red-100"
        >
          Delete
        </button>
        <select
          value={order.status}
          disabled={updatingStatusId === order._id}
          onChange={event => onStatusChange(event.target.value)}
          className="col-span-2 min-h-8 min-w-0 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs font-black text-stone-700 outline-none transition focus:border-emerald-500 disabled:opacity-50"
        >
          {ORDER_STATUSES.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </article>
  )
}

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatusId, setUpdatingStatusId] = useState('')
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [manualForm, setManualForm] = useState(createEmptyManualOrder)
  const [creatingOrder, setCreatingOrder] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/users'),
        api.get('/admin/products'),
      ])

      setOrders(ordersRes.data)
      setUsers(usersRes.data)
      setProducts(productsRes.data)
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Errore nel recupero ordini',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return orders.filter(order => {
      const customer = `${order.user?.name || ''} ${order.user?.email || ''}`.toLowerCase()
      const orderId = order._id.toLowerCase()
      const matchesSearch =
        !normalizedSearch ||
        customer.includes(normalizedSearch) ||
        orderId.includes(normalizedSearch)
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const paginatedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const manualTotal = useMemo(() => {
    return manualForm.items.reduce((sum, item) => {
      const product = products.find(productItem => productItem._id === item.productId)
      return sum + (product?.price || 0) * Number(item.quantity || 0)
    }, 0)
  }, [manualForm.items, products])

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingStatusId(orderId)
      const res = await api.put(`/admin/orders/${orderId}`, { status })
      setOrders(prev => prev.map(order => (order._id === orderId ? res.data : order)))
      setToast({ type: 'success', message: 'Status ordine aggiornato' })
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Errore aggiornamento status',
      })
    } finally {
      setUpdatingStatusId('')
    }
  }

  const handleDeleteOrder = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      setDeleting(true)
      await api.delete(`/admin/orders/${deleteTarget._id}`)
      setOrders(prev => prev.filter(order => order._id !== deleteTarget._id))
      setDeleteTarget(null)
      setToast({ type: 'success', message: 'Ordine eliminato' })
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Errore eliminazione ordine',
      })
    } finally {
      setDeleting(false)
    }
  }

  const updateManualItem = (index, field, value) => {
    setManualForm(prev => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const addManualItem = () => {
    setManualForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }],
    }))
  }

  const removeManualItem = (index) => {
    setManualForm(prev => ({
      ...prev,
      items: prev.items.filter((item, itemIndex) => itemIndex !== index),
    }))
  }

  const handleManualSubmit = async (event) => {
    event.preventDefault()

    try {
      setCreatingOrder(true)
      const payload = {
        userId: manualForm.userId,
        status: manualForm.status,
        items: manualForm.items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
        })),
      }

      const res = await api.post('/admin/orders', payload)
      setOrders(prev => [res.data, ...prev])
      setManualForm(createEmptyManualOrder())
      setManualModalOpen(false)
      setToast({ type: 'success', message: 'Ordine manuale creato' })
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Errore creazione ordine',
      })
    } finally {
      setCreatingOrder(false)
    }
  }

  if (loading) {
    return <LoadingSpinner label="Caricamento ordini..." />
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-x-hidden">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
            Orders
          </p>
          <h1 className="mt-1 text-2xl font-black text-stone-950 sm:mt-2 sm:text-3xl">
            Gestione ordini
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setManualModalOpen(true)}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 sm:min-h-11 sm:px-5 sm:py-2.5"
        >
          Add order
        </button>
      </section>

      <section className="rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_12px_35px_rgba(28,25,23,0.05)] sm:rounded-3xl sm:p-4">
        <div className="grid gap-2 sm:gap-3 lg:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={event => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search ordini, clienti, email"
            className="min-h-10 min-w-0 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
          />
          <select
            value={statusFilter}
            onChange={event => {
              setStatusFilter(event.target.value)
              setPage(1)
            }}
            className="min-h-10 min-w-0 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-bold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
          >
            <option value="all">Tutti gli status</option>
            {ORDER_STATUSES.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>

      {filteredOrders.length === 0 ? (
        <EmptyState
          title="Nessun ordine trovato"
          message="Modifica search o filtro status per ampliare i risultati."
        />
      ) : (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_14px_45px_rgba(28,25,23,0.07)] sm:rounded-3xl">
          <div className="grid min-w-0 gap-2 p-2 lg:hidden">
            {paginatedOrders.map(order => (
              <MobileOrderCard
                key={order._id}
                order={order}
                updatingStatusId={updatingStatusId}
                onView={() => setSelectedOrder(order)}
                onStatusChange={status => handleStatusChange(order._id, status)}
                onDelete={() => setDeleteTarget(order)}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full divide-y divide-stone-200 text-sm">
              <thead className="bg-stone-50 text-left text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedOrders.map(order => (
                  <tr key={order._id} className="align-middle">
                    <td className="px-4 py-3 font-black text-stone-950">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-stone-900">
                        {order.user?.name || 'Cliente rimosso'}
                      </p>
                      <p className="text-xs font-medium text-stone-500">
                        {order.user?.email || 'Email non disponibile'}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-black text-emerald-700">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={order.status} />
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {formatOrderDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-full border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-stone-50"
                        >
                          View
                        </button>
                        <select
                          value={order.status}
                          disabled={updatingStatusId === order._id}
                          onChange={event => handleStatusChange(order._id, event.target.value)}
                          className="rounded-full border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700 outline-none transition focus:border-emerald-500 disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(order)}
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
            totalItems={filteredOrders.length}
            onPrevious={() => setPage(prev => Math.max(1, prev - 1))}
            onNext={() => setPage(prev => Math.min(totalPages, prev + 1))}
          />
        </section>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-x-hidden bg-stone-950/60 px-3 backdrop-blur-sm sm:px-4">
          <div className="max-h-[90vh] w-full max-w-2xl min-w-0 overflow-y-auto rounded-2xl bg-white p-4 shadow-[0_24px_90px_rgba(28,25,23,0.28)] sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                  Order detail
                </p>
                <h2 className="mt-1 truncate text-xl font-black text-stone-950 sm:text-2xl">
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="min-h-10 rounded-full border border-stone-200 px-3 py-2 text-sm font-bold text-stone-700"
                aria-label="Chiudi dettaglio ordine"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
              <div className="min-w-0 rounded-2xl bg-stone-50 p-3 sm:p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-400">
                  Customer
                </p>
                <p className="mt-2 truncate font-bold text-stone-950">
                  {selectedOrder.user?.name || 'Cliente rimosso'}
                </p>
                <p className="truncate text-sm text-stone-500">
                  {selectedOrder.user?.email || 'Email non disponibile'}
                </p>
              </div>
              <div className="min-w-0 rounded-2xl bg-stone-50 p-3 sm:p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-400">
                  Totale
                </p>
                <p className="mt-2 truncate text-xl font-black text-emerald-700 sm:text-2xl">
                  {formatCurrency(selectedOrder.totalAmount)}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
              {selectedOrder.items.map(item => (
                <div
                  key={`${selectedOrder._id}-${item.productId}`}
                  className="grid min-w-0 grid-cols-[56px_1fr] gap-3 rounded-2xl border border-stone-200 p-2.5 sm:grid-cols-[80px_1fr_auto] sm:items-center sm:p-3"
                >
                  <img
                    src={item.image || 'https://via.placeholder.com/80?text=No+Image'}
                    alt={item.title}
                    className="h-14 w-14 rounded-xl object-cover sm:h-20 sm:w-20 sm:rounded-2xl"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-stone-950">{item.title}</p>
                    <p className="text-sm text-stone-500">Quantità: {item.quantity}</p>
                  </div>
                  <p className="col-span-2 text-right font-black text-stone-950 sm:col-span-1">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {manualModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-x-hidden bg-stone-950/60 px-3 backdrop-blur-sm sm:px-4">
          <form
            onSubmit={handleManualSubmit}
            className="max-h-[90vh] w-full max-w-3xl min-w-0 overflow-y-auto rounded-2xl bg-white p-4 shadow-[0_24px_90px_rgba(28,25,23,0.28)] sm:rounded-3xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                  Manual order
                </p>
                <h2 className="mt-1 text-xl font-black text-stone-950 sm:text-2xl">
                  Nuovo ordine
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setManualModalOpen(false)}
                disabled={creatingOrder}
                className="min-h-10 rounded-full border border-stone-200 px-3 py-2 text-sm font-bold text-stone-700 disabled:opacity-50"
                aria-label="Chiudi creazione ordine"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:mt-5 md:grid-cols-2">
              <label className="text-sm font-bold text-stone-700">
                Cliente
                <select
                  value={manualForm.userId}
                  onChange={event =>
                    setManualForm(prev => ({ ...prev, userId: event.target.value }))
                  }
                  required
                  className="mt-2 min-h-10 w-full min-w-0 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
                >
                  <option value="">Seleziona cliente</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} · {user.email}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-bold text-stone-700">
                Status
                <select
                  value={manualForm.status}
                  onChange={event =>
                    setManualForm(prev => ({ ...prev, status: event.target.value }))
                  }
                  className="mt-2 min-h-10 w-full min-w-0 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
              {manualForm.items.map((item, index) => (
                <div key={index} className="grid min-w-0 gap-2 rounded-2xl bg-stone-50 p-2.5 sm:gap-3 sm:p-3 md:grid-cols-[1fr_120px_auto]">
                  <select
                    value={item.productId}
                    onChange={event => updateManualItem(index, 'productId', event.target.value)}
                    required
                    className="min-h-10 min-w-0 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
                  >
                    <option value="">Prodotto</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.title} · {formatCurrency(product.price)} · stock {product.stock}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={event => updateManualItem(index, 'quantity', event.target.value)}
                    required
                    className="min-h-10 min-w-0 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
                  />

                  <button
                    type="button"
                    onClick={() => removeManualItem(index)}
                    disabled={manualForm.items.length === 1}
                    className="min-h-10 rounded-full bg-red-50 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12 sm:px-4 sm:py-2.5"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <button
                type="button"
                onClick={addManualItem}
                className="min-h-10 rounded-full border border-stone-200 px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-50 sm:min-h-11 sm:py-2.5"
              >
                Add product
              </button>
              <p className="truncate text-base font-black text-emerald-700 sm:text-lg">
                Totale stimato: {formatCurrency(manualTotal)}
              </p>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => setManualModalOpen(false)}
                disabled={creatingOrder}
                className="min-h-10 rounded-full border border-stone-200 px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50 sm:min-h-11 sm:py-2.5"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={creatingOrder}
                className="min-h-10 rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 sm:py-2.5"
              >
                {creatingOrder ? 'Creazione...' : 'Crea ordine'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Eliminare ordine?"
        message={`L'ordine #${deleteTarget?._id?.slice(-8).toUpperCase() || ''} verrà rimosso definitivamente.`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteOrder}
      />
    </div>
  )
}

export default AdminOrders
