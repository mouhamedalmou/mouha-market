import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { getStoredCart, saveStoredCart } from '../services/cart'
import { formatCurrency } from '../utils/formatters'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

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

  const addToCart = () => {
    if (product.stock <= 0) {
      setMessage('Prodotto momentaneamente esaurito')
      return
    }

    const existingCart = getStoredCart()

    const existingItem = existingCart.find(item => item._id === product._id)

    let updatedCart

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        setMessage('Hai già raggiunto la quantità disponibile per questo prodotto')
        return
      }

      updatedCart = existingCart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      updatedCart = [...existingCart, { ...product, quantity: 1 }]
    }

    saveStoredCart(updatedCart)
    navigate('/cart')
  }

  if (loading) {
    return (
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-lg sm:p-8">
        <p className="text-sm font-medium text-stone-500">Sto caricando i dettagli del prodotto...</p>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold text-stone-900">Prodotto non trovato</h1>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
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
        className="mb-6 inline-flex rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
      >
        Torna ai prodotti
      </button>

      <section className="overflow-hidden rounded-[34px] border border-white/70 bg-white/90 p-4 shadow-lg sm:p-6 lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
        <div className="overflow-hidden rounded-[30px] bg-stone-100">
          <img
            src={product.image || 'https://via.placeholder.com/500x400?text=No+Image'}
            alt={product.title}
            className="h-[320px] w-full object-cover sm:h-[420px] lg:h-full"
          />
        </div>

        <div className="mt-6 flex flex-col lg:mt-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
              {product.category}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${
                product.stock > 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {product.stock > 0 ? `${product.stock} disponibili` : 'Esaurito'}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black text-stone-900 sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base">
            {product.description}
          </p>

          {message && (
            <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              {message}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <p className="text-3xl font-black text-emerald-600 sm:text-4xl">
              {formatCurrency(product.price)}
            </p>
            <p className="text-sm font-medium text-stone-500">
              Totale confermato dal server al checkout
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={addToCart}
              disabled={product.stock <= 0}
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {product.stock > 0 ? 'Aggiungi al carrello' : 'Prodotto esaurito'}
            </button>

            <Link
              to="/cart"
              className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
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
