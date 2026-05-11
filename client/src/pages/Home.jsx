import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

function Home() {
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products')
        setProducts(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return products
    }

    return products.filter((product) => {
      const price = product.price ?? ''
      const searchableValues = [
        product.title,
        product.name,
        product.category,
        product.description,
        String(price),
        String(price).replace('.', ','),
      ]

      return searchableValues.some((value) =>
        String(value ?? '').toLowerCase().includes(query)
      )
    })
  }, [products, searchTerm])

  useEffect(() => {
    if (loading || location.hash !== '#products') {
      return
    }

    document.getElementById('products')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [loading, location.hash])

  if (loading) {
    return (
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-lg sm:p-8">
        <p className="text-sm font-medium text-stone-500">Sto caricando il catalogo...</p>
      </section>
    )
  }

  const categoryCount = new Set(products.map(product => product.category)).size

  return (
    <>
      <section className="mb-8 overflow-hidden rounded-[34px] border border-white/70 bg-white/85 p-6 shadow-lg sm:p-8 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">
            Nuova selezione
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-stone-900 sm:text-5xl">
            Prodotti tech e lifestyle con uno shop più chiaro anche da mobile.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
            Sfoglia il catalogo, aggiungi prodotti al carrello e segui i tuoi ordini in un flusso più pulito e veloce.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/cart"
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              Vai al carrello
            </Link>

            <Link
              to="/auth"
              className="rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
            >
              Accedi o registrati
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-[30px] bg-stone-900 p-5 text-white shadow-sm sm:grid-cols-3 lg:mt-0">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
              Prodotti
            </p>
            <p className="mt-3 text-3xl font-black">{products.length}</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
              Categorie
            </p>
            <p className="mt-3 text-3xl font-black">{categoryCount}</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
              Esperienza
            </p>
            <p className="mt-3 text-lg font-bold">Responsive e pronta al checkout</p>
          </div>
        </div>
      </section>

      <section
        id="products"
        className="mb-6 rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full">
            <label
              htmlFor="product-search"
              className="text-sm font-black uppercase tracking-[0.22em] text-stone-700"
            >
              Cerca prodotti
            </label>

            <input
              id="product-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nome, categoria, descrizione o prezzo"
              className="mt-3 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base font-medium text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/70"
            />
          </div>

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 sm:shrink-0"
            >
              Cancella
            </button>
          )}
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-lg sm:p-8">
          <p className="text-sm font-medium text-stone-500">No products found</p>
        </section>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </section>
      )}
    </>
  )
}

export default Home
