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

  if (cart.length === 0) {
    return (
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-lg sm:p-8">
        <h1 className="text-3xl font-black text-stone-900">Carrello</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
          Il carrello è vuoto. Scegli qualche prodotto e torna qui quando vuoi completare l'ordine.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
        >
          Continua acquisti
        </Link>
      </section>
    )
  }

  return (
    <>
      <section className="mb-6 rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Checkout
            </p>
            <h1 className="mt-2 text-3xl font-black text-stone-900 sm:text-4xl">
              Il tuo carrello
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              Rivedi quantità e totale. Al momento del checkout il server controlla prezzo e disponibilità reali.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
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
              className="rounded-[30px] border border-white/75 bg-white/90 p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <img
                  src={item.image || 'https://via.placeholder.com/120?text=No+Image'}
                  alt={item.title}
                  className="h-28 w-full rounded-[24px] object-cover sm:w-28"
                />

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-stone-900">{item.title}</h2>
                  <p className="mt-1 text-sm text-stone-500">{formatCurrency(item.price)}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                    Quantità nel carrello: {item.quantity}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 sm:flex-col">
                  <button
                    onClick={() => updateQuantity(item._id, 1)}
                    className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-200"
                  >
                    +
                  </button>
                  <button
                    onClick={() => updateQuantity(item._id, -1)}
                    className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-200"
                  >
                    -
                  </button>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-[32px] border border-white/75 bg-white/90 p-6 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Riepilogo ordine
          </p>
          <h2 className="mt-2 text-2xl font-black text-stone-900">Totale carrello</h2>

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
              <span className="text-base font-bold text-stone-900">Totale</span>
              <span className="text-2xl font-black text-emerald-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {message && (
            <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              {message}
            </p>
          )}

          {!getStoredToken() && (
            <p className="mt-5 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
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
            className="mt-6 w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingOrder ? 'Invio ordine...' : 'Completa checkout'}
          </button>
        </aside>
      </section>
    </>
  )
}

export default Cart
