import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatters'

function ProductCard({ product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white/90 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <img
          src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.title}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-stone-700 shadow-sm">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-xl font-bold text-stone-900">{product.title}</h2>

        <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">
          {product.description}
        </p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <span className="text-2xl font-black text-emerald-600">
              {formatCurrency(product.price)}
            </span>
            <p className="mt-1 text-xs font-medium text-stone-500">
              {product.stock > 0 ? `${product.stock} disponibili` : 'Esaurito'}
            </p>
          </div>

          <Link
            to={`/products/${product._id}`}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Dettagli
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
