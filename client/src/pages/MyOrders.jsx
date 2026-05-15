import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import LoadingState from '../components/LoadingState'
import { isAuthenticated } from '../services/session'
import { formatCurrency, formatOrderDate } from '../utils/formatters'

const statusStyles = {
  pending: 'bg-orange-100 text-orange-800 ring-orange-200',
  preparing: 'bg-orange-100 text-orange-800 ring-orange-200',
  paid: 'bg-blue-100 text-blue-800 ring-blue-200',
  shipped: 'bg-blue-100 text-blue-800 ring-blue-200',
  ready: 'bg-blue-100 text-blue-800 ring-blue-200',
  delivered: 'bg-green-100 text-green-800 ring-green-200',
}

const statusLabels = {
  pending: 'Preparazione',
  preparing: 'Preparazione',
  paid: 'Pronto',
  shipped: 'Pronto',
  ready: 'Pronto',
  delivered: 'Consegnato',
}

function DetailIcon({ type }) {
  const paths = {
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 12 19.8 19.8 0 0 1 2.08 3.37 2 2 0 0 1 4.06 1.2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.61a2 2 0 0 1-.45 2.11L8.1 8.75a16 16 0 0 0 7.15 7.15l1.11-1.11a2 2 0 0 1 2.11-.45c.84.28 1.72.48 2.61.6A2 2 0 0 1 22 16.92Z" />,
    address: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    notes: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[type]}
    </svg>
  )
}

function DetailItem({ icon, label, value, wide = false }) {
  return (
    <div className={`rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-100 ${wide ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-stone-400">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-stone-700 shadow-sm">
          <DetailIcon type={icon} />
        </span>
        {label}
      </div>
      <p className="mt-2 text-sm font-bold leading-6 text-stone-900">
        {value || 'Non indicato'}
      </p>
    </div>
  )
}

function getCustomerName(order) {
  return (
    order.customer?.name ||
    order.customerName ||
    order.user?.name ||
    order.shippingAddress?.name ||
    'Cliente'
  )
}

function getPhone(order) {
  return (
    order.customer?.phone ||
    order.customerPhone ||
    order.phone ||
    order.shippingAddress?.phone ||
    order.deliveryAddress?.phone ||
    ''
  )
}

function getAddress(order) {
  const address = order.deliveryAddress || order.shippingAddress || order.address || order.customer?.address

  if (typeof address === 'string') {
    return address
  }

  if (address && typeof address === 'object') {
    return [
      address.street || address.address || address.line1,
      address.city,
      address.postalCode || address.zip,
      address.country,
    ]
      .filter(Boolean)
      .join(', ')
  }

  return ''
}

function getNotes(order) {
  return (
    order.notes ||
    order.note ||
    order.deliveryNotes ||
    order.customer?.notes ||
    ''
  )
}

function getOrderItemCount(order) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

function MyOrders() {
  const location = useLocation()
  const navigate = useNavigate()
  const loggedIn = isAuthenticated()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(location.state?.message || '')

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    if (!loggedIn) {
      setLoading(false)
      return
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders')
        setOrders(res.data)
      } catch (err) {
        console.error(err)
        setMessage(err.response?.data?.message || 'Errore nel recupero degli ordini')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [loggedIn])

  if (!loggedIn) {
    return (
      <section className="w-full max-w-6xl self-center rounded-2xl border border-white/80 bg-white/95 p-6 shadow-[0_18px_55px_rgba(28,25,23,0.08)] sm:p-8">
        <h1 className="text-3xl font-black text-stone-950">I miei ordini</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
          Devi accedere per vedere lo storico degli ordini e seguire i tuoi acquisti.
        </p>

        <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
          <Link
            to="/auth"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Accedi ora
          </Link>

          <Link
            to="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            Torna ai prodotti
          </Link>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <div className="w-full max-w-6xl self-center">
        <LoadingState
          label="Sto caricando i tuoi ordini..."
          helper="Recuperiamo storico acquisti, stati e riepiloghi."
        />
      </div>
    )
  }

  const totalItems = orders.reduce((sum, order) => sum + getOrderItemCount(order), 0)
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)

  return (
    <div className="w-full max-w-6xl self-center">
      <section className="mb-5 rounded-2xl border border-white/80 bg-white/95 p-5 shadow-[0_18px_55px_rgba(28,25,23,0.08)] sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
              Grocery booking
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-stone-950 sm:text-4xl">
              I tuoi ordini
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              Controlla stato, prodotti ordinati e totale in un riepilogo compatto e leggibile.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <div className="rounded-2xl bg-stone-50 p-3 ring-1 ring-stone-100">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-stone-400">
                Ordini
              </p>
              <p className="mt-1 text-2xl font-black text-stone-950">{orders.length}</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 ring-1 ring-blue-100">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-blue-700">
                Prodotti
              </p>
              <p className="mt-1 text-2xl font-black text-blue-950">{totalItems}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">
                Totale
              </p>
              <p className="mt-1 truncate text-xl font-black text-emerald-950">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
            {message}
          </p>
        )}
      </section>

      {orders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-stone-300 bg-white/90 p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-2xl font-black text-stone-950">Ancora nessun ordine</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
            Appena completi il primo checkout, il riepilogo apparirà qui con data, prodotti e stato dell'ordine.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Scopri i prodotti
          </Link>
        </section>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <article
              key={order._id}
              className="group overflow-hidden rounded-2xl border border-stone-200/70 bg-white/95 shadow-[0_14px_45px_rgba(28,25,23,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_65px_rgba(28,25,23,0.12)]"
            >
              <div className="flex flex-col gap-3 border-b border-stone-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-400">
                    Ordine #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-stone-500">
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ring-1 ${
                    statusStyles[order.status] || 'bg-stone-100 text-stone-700 ring-stone-200'
                  }`}
                >
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-5">
                  <section>
                    <h2 className="text-sm font-black uppercase tracking-[0.16em] text-stone-500">
                      Informazioni cliente
                    </h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <DetailItem icon="user" label="Nome" value={getCustomerName(order)} />
                      <DetailItem icon="phone" label="Telefono" value={getPhone(order)} />
                      <DetailItem icon="address" label="Indirizzo" value={getAddress(order)} wide />
                      <DetailItem icon="notes" label="Note" value={getNotes(order)} wide />
                    </div>
                  </section>

                  <section className="border-t border-stone-100 pt-5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-black uppercase tracking-[0.16em] text-stone-500">
                        Prodotti ordinati
                      </h2>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">
                        {getOrderItemCount(order)} pezzi
                      </span>
                    </div>

                    <div className="mt-3 divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50">
                      {order.items.map(item => (
                        <div
                          key={`${order._id}-${item.productId}`}
                          className="grid gap-3 p-3 sm:grid-cols-[64px_1fr_auto] sm:items-center"
                        >
                          <img
                            src={item.image || 'https://via.placeholder.com/96?text=No+Image'}
                            alt={item.title}
                            className="aspect-square w-full rounded-xl object-cover sm:w-16"
                            loading="lazy"
                          />

                          <div className="min-w-0">
                            <h3 className="font-black leading-snug text-stone-950">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-stone-500">
                              {formatCurrency(item.price)} cad.
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-stone-700 ring-1 ring-stone-200">
                              x{item.quantity}
                            </span>
                            <p className="font-black text-stone-950 sm:mt-2">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <aside className="h-fit rounded-2xl bg-stone-950 p-5 text-white shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-300">
                    Totale ordine
                  </p>
                  <p className="mt-3 text-3xl font-black tracking-normal text-white">
                    {formatCurrency(order.totalAmount)}
                  </p>

                  <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm text-stone-300">
                    <div className="flex items-center justify-between gap-4">
                      <span>Righe prodotto</span>
                      <span className="font-bold text-white">{order.items.length}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Quantità totale</span>
                      <span className="font-bold text-white">{getOrderItemCount(order)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Stato</span>
                      <span className="font-bold text-white">
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                </aside>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrders
