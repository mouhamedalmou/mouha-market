import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import LoadingState from '../components/LoadingState'
import { getStoredCart, saveStoredCart } from '../services/cart'
import { formatCurrency } from '../utils/formatters'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        setProduct(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  useEffect(() => {
    setQuantity(1)
    setMessage('')
  }, [id])

  const clampQuantity = (value, stock) => {
    const nextValue = Number(value)

    if (!Number.isFinite(nextValue)) {
      return 1
    }

    return Math.min(Math.max(Math.floor(nextValue), 1), Math.max(stock, 1))
  }

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1))
  }

  const increaseQuantity = () => {
    if (!product) {
      return
    }

    setQuantity(prev => Math.min(product.stock, prev + 1))
  }

  const handleQuantityChange = (event) => {
    if (!product) {
      return
    }

    setQuantity(clampQuantity(event.target.value, product.stock))
  }

  const addToCart = () => {
    if (product.stock <= 0) {
      setMessage('Prodotto momentaneamente esaurito')
      return
    }

    const existingCart = getStoredCart()

    const existingItem = existingCart.find(item => item._id === product._id)

    let updatedCart

    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        setMessage('Hai già raggiunto la quantità disponibile per questo prodotto')
        return
      }

      updatedCart = existingCart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    } else {
      updatedCart = [...existingCart, { ...product, quantity }]
    }

    saveStoredCart(updatedCart)
    navigate('/cart')
  }

  if (loading) {
    return (
      <LoadingState
        label="Sto caricando i dettagli del prodotto..."
        helper="Controlliamo disponibilità, prezzo e informazioni aggiornate."
      />
    )
  }

  if (!product) {
    return (
      <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(28,25,23,0.08)] sm:p-8">
        <h1 className="text-2xl font-black text-stone-950">Prodotto non trovato</h1>
        <Link
          to="/"
          className="mt-5 inline-flex min-h-12 items-center rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          Torna ai prodotti
        </Link>
      </section>
    )
  }

  return (
    <>
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex min-h-11 items-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
      >
        Torna ai prodotti
      </button>

      <section className="grid gap-6 overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-4 shadow-[0_22px_70px_rgba(28,25,23,0.10)] sm:p-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
        <div className="overflow-hidden rounded-3xl bg-stone-100">
          <img
            src={product.image || 'https://via.placeholder.com/500x400?text=No+Image'}
            alt={product.title}
            className="aspect-[4/3] w-full object-cover lg:aspect-auto lg:h-full"
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-700 ring-1 ring-emerald-100">
              {product.category}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ring-1 ${
                product.stock > 0
                  ? 'bg-sky-50 text-sky-700 ring-sky-100'
                  : 'bg-stone-100 text-stone-600 ring-stone-200'
              }`}
            >
              {product.stock > 0 ? `${product.stock} disponibili` : 'Esaurito'}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight text-stone-950 sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base">
            {product.description}
          </p>

          {message && (
            <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 ring-1 ring-amber-100">
              {message}
            </p>
          )}

          <div className="mt-8 rounded-3xl bg-stone-50 p-5 ring-1 ring-stone-100">
            <p className="text-3xl font-black text-emerald-700 sm:text-4xl">
              {formatCurrency(product.price)}
            </p>
            <p className="mt-2 text-sm font-medium text-stone-500">
              Totale confermato dal server al checkout
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block text-sm font-bold text-stone-700">
                Quantità
                <div className="mt-2 grid w-full grid-cols-[48px_1fr_48px] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm sm:w-44">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={product.stock <= 0 || quantity <= 1}
                    className="grid min-h-12 place-items-center text-lg font-black text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
                    aria-label="Diminuisci quantità"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={Math.max(product.stock, 1)}
                    value={quantity}
                    onChange={handleQuantityChange}
                    disabled={product.stock <= 0}
                    className="min-h-12 border-x border-stone-200 text-center text-sm font-black text-stone-950 outline-none disabled:bg-stone-50 disabled:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={product.stock <= 0 || quantity >= product.stock}
                    className="grid min-h-12 place-items-center text-lg font-black text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
                    aria-label="Aumenta quantità"
                  >
                    +
                  </button>
                </div>
              </label>

              <button
                onClick={addToCart}
                disabled={product.stock <= 0}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {product.stock > 0 ? 'Aggiungi al carrello' : 'Prodotto esaurito'}
              </button>
            </div>

            <Link
              to="/cart"
              className="mt-3 inline-flex min-h-12 items-center justify-center rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
            >
              Apri carrello
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default ProductDetail
