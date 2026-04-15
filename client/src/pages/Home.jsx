import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

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

      {products.length === 0 ? (
        <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-lg sm:p-8">
          <p className="text-sm font-medium text-stone-500">Nessun prodotto trovato</p>
        </section>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </section>
      )}
    </>
  )
}

export default Home
