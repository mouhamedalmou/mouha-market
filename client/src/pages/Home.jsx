import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../services/api'
import heroImage from '../assets/hero.png'
import LoadingState, { ProductGridSkeleton } from '../components/LoadingState'
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
      <>
        <LoadingState
          label="Sto caricando il catalogo..."
          helper="Prepariamo prodotti, disponibilità e categorie."
        />
        <div className="mt-6">
          <ProductGridSkeleton />
        </div>
      </>
    )
  }

  const categoryCount = new Set(products.map(product => product.category)).size

  return (
    <>
      <section className="mb-8 grid gap-8 py-3 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-8">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700 sm:text-sm">
            Nuova selezione
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-stone-950 sm:text-5xl">
            Shopping tech e lifestyle, veloce da sfogliare e facile da completare.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
            Sfoglia il catalogo, controlla disponibilità reali e passa al checkout con un flusso pulito anche sotto i 400px.
          </p>

          <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
            <Link
              to="#products"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            >
              Esplora prodotti
            </Link>

            <Link
              to="/cart"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-bold text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-stone-100"
            >
              Vai al carrello
            </Link>
          </div>
        </div>

        <div className="relative min-w-0 overflow-hidden rounded-3xl bg-stone-950 p-5 text-white shadow-[0_24px_80px_rgba(28,25,23,0.18)] sm:p-6">
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(90deg,rgba(16,185,129,0.35),rgba(245,158,11,0.28),rgba(14,165,233,0.25))]" />
          <div className="relative grid gap-4 sm:grid-cols-[0.8fr_1.2fr] sm:items-center">
            <div className="mx-auto grid h-40 w-40 place-items-center rounded-[2rem] bg-white/10 sm:h-48 sm:w-48">
              <img
                src={heroImage}
                alt=""
                className="h-32 w-32 object-contain sm:h-40 sm:w-40"
                aria-hidden="true"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-300">
                  Prodotti
                </p>
                <p className="mt-3 text-3xl font-black">{products.length}</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-300">
                  Categorie
                </p>
                <p className="mt-3 text-3xl font-black">{categoryCount}</p>
              </div>

              <div className="col-span-2 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-300">
                  Checkout
                </p>
                <p className="mt-3 text-lg font-black leading-snug">
                  Carrello, ordini e admin in un unico flusso responsive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="products"
        className="mb-6 scroll-mt-28 rounded-3xl border border-white/80 bg-white/95 p-4 shadow-[0_14px_45px_rgba(28,25,23,0.06)] sm:p-5"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="w-full">
            <label
              htmlFor="product-search"
              className="text-xs font-black uppercase tracking-[0.18em] text-stone-500"
            >
              Cerca prodotti
            </label>

            <input
              id="product-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nome, categoria, descrizione o prezzo"
              className="mt-3 min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base font-medium text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="min-h-12 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 md:shrink-0"
            >
              Cancella
            </button>
          )}
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-stone-300 bg-white/80 p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-2xl font-black text-stone-950">Nessun prodotto trovato</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-500">
            Prova a cercare per categoria, nome prodotto o prezzo.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </section>
      )}
    </>
  )
}

export default Home
