import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import LoadingState from '../components/LoadingState'
import { isAuthenticated } from '../services/session'
import { formatCurrency, formatOrderDate } from '../utils/formatters'

const statusStyles = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-100',
  paid: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  shipped: 'bg-sky-50 text-sky-800 ring-sky-100',
  delivered: 'bg-stone-950 text-white ring-stone-950',
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
      <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(28,25,23,0.08)] sm:p-8">
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
      <LoadingState
        label="Sto caricando i tuoi ordini..."
        helper="Recuperiamo storico acquisti, stati e riepiloghi."
      />
    )
  }

  return (
    <>
      <section className="mb-6 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(28,25,23,0.08)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
              Storico acquisti
            </p>
            <h1 className="mt-2 text-3xl font-black text-stone-950 sm:text-4xl">
              I miei ordini
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              Qui trovi gli ordini più recenti, con stato, prodotti acquistati e totale finale confermato dal server.
            </p>
          </div>

          <div className="rounded-3xl bg-stone-950 px-5 py-4 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-300">
              Ordini registrati
            </p>
            <p className="mt-2 text-3xl font-black">{orders.length}</p>
          </div>
        </div>

        {message && (
          <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
            {message}
          </p>
        )}
      </section>

      {orders.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-stone-300 bg-white/80 p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-2xl font-black text-stone-950">Ancora nessun ordine</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
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
        <div className="space-y-5">
          {orders.map(order => (
            <article
              key={order._id}
              className="overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-[0_18px_60px_rgba(28,25,23,0.08)]"
            >
              <div className="border-b border-stone-100 px-5 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                      Ordine #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="mt-2 text-sm font-medium text-stone-500">
                      Creato il {formatOrderDate(order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ring-1 ${
                      statusStyles[order.status] || 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1.45fr_0.75fr]">
                <div className="space-y-3">
                  {order.items.map(item => (
                    <div
                      key={`${order._id}-${item.productId}`}
                      className="grid gap-4 rounded-3xl border border-stone-100 bg-stone-50 p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center"
                    >
                      <img
                        src={item.image || 'https://via.placeholder.com/120?text=No+Image'}
                        alt={item.title}
                        className="aspect-[4/3] w-full rounded-2xl object-cover sm:aspect-square"
                      />

                      <div className="min-w-0">
                        <h3 className="text-lg font-black text-stone-950">{item.title}</h3>
                        <p className="mt-1 text-sm text-stone-500">
                          Quantità: {item.quantity}
                        </p>
                      </div>

                      <p className="text-lg font-black text-stone-950">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <aside className="rounded-3xl bg-stone-950 p-5 text-white shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-300">
                    Riepilogo
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-stone-200">
                    <div className="flex items-center justify-between gap-4">
                      <span>Prodotti</span>
                      <span>{order.items.length}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Pezzi totali</span>
                      <span>
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Totale ordine</span>
                      <span className="text-lg font-black text-white">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </aside>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

export default MyOrders
