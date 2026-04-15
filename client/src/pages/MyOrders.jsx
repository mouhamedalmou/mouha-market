import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated } from '../services/session'
import { formatCurrency, formatOrderDate } from '../utils/formatters'

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  shipped: 'bg-sky-100 text-sky-700',
  delivered: 'bg-stone-900 text-white',
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
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-lg sm:p-8">
        <h1 className="text-3xl font-black text-stone-900">I miei ordini</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
          Devi accedere per vedere lo storico degli ordini e seguire i tuoi acquisti.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/auth"
            className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Accedi ora
          </Link>

          <Link
            to="/"
            className="rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            Torna ai prodotti
          </Link>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-lg sm:p-8">
        <p className="text-sm font-medium text-stone-500">Sto caricando i tuoi ordini...</p>
      </section>
    )
  }

  return (
    <>
      <section className="mb-6 rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Storico acquisti
            </p>
            <h1 className="mt-2 text-3xl font-black text-stone-900 sm:text-4xl">
              I miei ordini
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              Qui trovi gli ordini più recenti, con stato, prodotti acquistati e totale finale confermato dal server.
            </p>
          </div>

          <div className="rounded-3xl bg-stone-900 px-5 py-4 text-white shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-300">
              Ordini registrati
            </p>
            <p className="mt-2 text-3xl font-black">{orders.length}</p>
          </div>
        </div>

        {message && (
          <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </p>
        )}
      </section>

      {orders.length === 0 ? (
        <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-lg sm:p-8">
          <h2 className="text-2xl font-bold text-stone-900">Ancora nessun ordine</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
            Appena completi il primo checkout, il riepilogo apparirà qui con data, prodotti e stato dell'ordine.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Scopri i prodotti
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          {orders.map(order => (
            <article
              key={order._id}
              className="overflow-hidden rounded-[30px] border border-white/75 bg-white/90 shadow-lg"
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
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${
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
                      className="flex flex-col gap-4 rounded-3xl border border-stone-100 bg-stone-50 p-4 sm:flex-row sm:items-center"
                    >
                      <img
                        src={item.image || 'https://via.placeholder.com/120?text=No+Image'}
                        alt={item.title}
                        className="h-24 w-full rounded-2xl object-cover sm:w-24"
                      />

                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-stone-900">{item.title}</h3>
                        <p className="mt-1 text-sm text-stone-500">
                          Quantità: {item.quantity}
                        </p>
                      </div>

                      <p className="text-lg font-black text-stone-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <aside className="rounded-[28px] bg-stone-900 p-5 text-white shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
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
