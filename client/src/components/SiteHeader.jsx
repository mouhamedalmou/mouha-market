import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { getCartItemCount, subscribeToCartChanges } from '../services/cart'
import {
  clearSession,
  getStoredUser,
  isAuthenticated,
  subscribeToSessionChanges,
} from '../services/session'

const navLinkBase =
  'rounded-full px-4 py-2 text-sm font-semibold transition'

function SiteHeader() {
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(getCartItemCount())
  const [user, setUser] = useState(getStoredUser())

  useEffect(() => {
    return subscribeToCartChanges(() => {
      setCartCount(getCartItemCount())
    })
  }, [])

  useEffect(() => {
    return subscribeToSessionChanges((sessionUser) => {
      setUser(sessionUser)
    })
  }, [])

  const handleLogout = () => {
    clearSession()
    navigate('/')
  }

  const linkClassName = ({ isActive }) =>
    `${navLinkBase} ${
      isActive
        ? 'bg-stone-900 text-white shadow-sm'
        : 'bg-white/80 text-stone-700 hover:bg-white'
    }`

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-400 text-sm font-black text-stone-900 shadow-sm">
            MM
          </span>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-700">
              Ecommerce
            </p>
            <p className="text-lg font-semibold text-stone-900">
              Mouha Market
            </p>
          </div>
        </Link>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <NavLink to="/" className={linkClassName}>
            Prodotti
          </NavLink>

          {isAuthenticated() && (
            <NavLink to="/my-orders" className={linkClassName}>
              I miei ordini
            </NavLink>
          )}

          {isAuthenticated() && (user?.role === 'admin' || user?.isAdmin) && (
            <NavLink to="/admin" className={linkClassName}>
              Admin
            </NavLink>
          )}

          <NavLink to="/cart" className={linkClassName}>
            <span className="inline-flex items-center gap-2">
              Carrello
              {cartCount > 0 && (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-stone-900">
                  {cartCount}
                </span>
              )}
            </span>
          </NavLink>

          {isAuthenticated() ? (
            <>
              {user?.name && (
                <span className="hidden text-sm font-medium text-stone-500 lg:inline">
                  Ciao, {user.name}
                </span>
              )}

              <button
                onClick={handleLogout}
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/auth" className={linkClassName}>
              Accedi
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
