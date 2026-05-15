import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import {
  clearStoredCart,
  getStoredCart,
  saveStoredCart,
  subscribeToCartChanges,
} from '../services/cart'
import { getStoredToken } from '../services/session'
import { formatCurrency } from '../utils/formatters'

function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [message, setMessage] = useState('')
  const [loadingOrder, setLoadingOrder] = useState(false)

  useEffect(() => {
    setCart(getStoredCart())

    return subscribeToCartChanges((updatedCart) => {
      setCart(updatedCart)
    })
  }, [])

  const updateQuantity = (_id, amount) => {
    let nextMessage = ''

    const updatedCart = cart
      .map(item => {
        if (item._id !== _id) {
          return item
        }

        const nextQuantity = item.quantity + amount

        if (amount > 0 && typeof item.stock === 'number' && nextQuantity > item.stock) {
          nextMessage = `Hai raggiunto il massimo disponibile per ${item.title}`
          return item
        }

        return { ...item, quantity: nextQuantity }
      })
      .filter(item => item.quantity > 0)

    setMessage(nextMessage)
    saveStoredCart(updatedCart)
  }

  const removeItem = (_id) => {
    const updatedCart = cart.filter(item => item._id !== _id)
    saveStoredCart(updatedCart)
  }

  const handleCheckout = async () => {
    const token = getStoredToken()

    if (!token) {
      setMessage('Devi effettuare il login prima di completare l\'ordine')
      return
    }

    try {
      setLoadingOrder(true)
      setMessage('')

      const payload = {
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity,
        })),
      }

      await api.post('/orders', payload)

      clearStoredCart()
      navigate('/my-orders', {
        state: {
          message: 'Ordine inviato con successo. Qui sotto trovi il riepilogo.',
        },
      })
    } catch (err) {
      console.error(err)
      setMessage(err.response?.data?.message || 'Errore durante il checkout')
    } finally {
      setLoadingOrder(false)
    }
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const piecesCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const hasToken = Boolean(getStoredToken())

  if (cart.length === 0) {
    return (
      <section className="grid gap-6 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(28,25,23,0.08)] sm:p-8 lg:grid-cols-[1fr_0.65fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
            Carrello
          </p>
          <h1 className="mt-2 text-3xl font-black text-stone-950 sm:text-4xl">
            Il carrello è vuoto
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
            Scegli qualche prodotto e torna qui quando vuoi completare l'ordine.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Continua acquisti
          </Link>
        </div>

        <div className="rounded-3xl bg-stone-950 p-5 text-white">
          <p className="text-sm font-bold text-stone-300">Pronto quando lo sei</p>
          <p className="mt-3 text-2xl font-black leading-tight">
            Aggiungi prodotti, rivedi quantità e completa il checkout in pochi tap.
          </p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="mb-6 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(28,25,23,0.08)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
              Checkout
            </p>
            <h1 className="mt-2 text-3xl font-black text-stone-950 sm:text-4xl">
              Il tuo carrello
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              Rivedi quantità e totale. Al momento del checkout il server controlla prezzo e disponibilità reali.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            Continua acquisti
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <div className="space-y-4">
          {cart.map(item => (
            <article
              key={item._id}
              className="rounded-3xl border border-white/80 bg-white/95 p-4 shadow-[0_14px_45px_rgba(28,25,23,0.06)] sm:p-5"
            >
              <div className="grid gap-4 sm:grid-cols-[120px_1fr] sm:items-center lg:grid-cols-[128px_1fr_auto]">
                <img
                  src={item.image || 'https://via.placeholder.com/120?text=No+Image'}
                  alt={item.title}
                  className="aspect-[4/3] w-full rounded-2xl object-cover sm:aspect-square"
                />

                <div className="min-w-0">
                  <h2 className="text-lg font-black leading-snug text-stone-950 sm:text-xl">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm font-bold text-emerald-700">
                    {formatCurrency(item.price)}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                    Subtotale: {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1 lg:min-w-44">
                  <div className="grid grid-cols-[48px_1fr_48px] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <button
                      onClick={() => updateQuantity(item._id, -1)}
                      disabled={item.quantity <= 1}
                      className="grid min-h-12 place-items-center text-lg font-black text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
                      aria-label={`Diminuisci quantità di ${item.title}`}
                    >
                      -
                    </button>
                    <div className="grid min-h-12 place-items-center border-x border-stone-200 text-sm font-black text-stone-950">
                      {item.quantity}
                    </div>
                    <button
                      onClick={() => updateQuantity(item._id, 1)}
                      disabled={typeof item.stock === 'number' && item.quantity >= item.stock}
                      className="grid min-h-12 place-items-center text-lg font-black text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
                      aria-label={`Aumenta quantità di ${item.title}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item._id)}
                    className="min-h-11 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_22px_70px_rgba(28,25,23,0.10)] lg:sticky lg:top-24">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
            Riepilogo ordine
          </p>
          <h2 className="mt-2 text-2xl font-black text-stone-950">Totale carrello</h2>

          <div className="mt-6 space-y-3 text-sm text-stone-600">
            <div className="flex items-center justify-between gap-4">
              <span>Articoli</span>
              <span className="font-semibold text-stone-900">{cart.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Pezzi totali</span>
              <span className="font-semibold text-stone-900">{piecesCount}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-stone-100 pt-3">
              <span className="text-base font-black text-stone-950">Totale</span>
              <span className="text-2xl font-black text-emerald-700">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {message && (
            <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 ring-1 ring-amber-100">
              {message}
            </p>
          )}

          {!hasToken && (
            <p className="mt-5 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600 ring-1 ring-stone-100">
              Accedi da{' '}
              <Link to="/auth" className="font-semibold text-stone-900 underline">
                questa pagina
              </Link>{' '}
              per completare l'ordine.
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={loadingOrder}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingOrder && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {loadingOrder ? 'Invio ordine...' : 'Completa checkout'}
          </button>
        </aside>
      </section>
    </>
  )
}

export default Cart
