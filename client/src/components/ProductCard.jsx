import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatters'

function ProductCard({ product }) {
  const inStock = product.stock > 0

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-[0_14px_45px_rgba(28,25,23,0.07)] transition duration-300 motion-safe:md:hover:-translate-y-1 motion-safe:md:hover:shadow-[0_22px_70px_rgba(28,25,23,0.13)]">
      <Link to={`/products/${product._id}`} className="relative block overflow-hidden bg-stone-100">
        <img
          src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.title}
          className="aspect-[4/3] w-full object-cover transition duration-500 motion-safe:md:group-hover:scale-105"
          loading="lazy"
        />

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-stone-700 shadow-sm backdrop-blur">
          {product.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="line-clamp-2 text-lg font-black leading-snug text-stone-950">
            {product.title}
          </h2>
          <span
            className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${
              inStock
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                : 'bg-stone-100 text-stone-500 ring-1 ring-stone-200'
            }`}
          >
            {inStock ? 'Stock' : 'Esaurito'}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-stone-600">
          {product.description}
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-2xl font-black text-emerald-700">
                {formatCurrency(product.price)}
              </span>
              <p className="mt-1 text-xs font-bold text-stone-500">
                {inStock ? `${product.stock} disponibili` : 'Non disponibile'}
              </p>
            </div>
          </div>

          <Link
            to={`/products/${product._id}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          >
            Vedi dettagli
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
