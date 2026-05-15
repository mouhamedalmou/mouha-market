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
  'inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-bold transition duration-200'
const mobileLinkBase =
  'flex min-h-12 items-center justify-between rounded-2xl px-4 py-3 text-base font-bold transition duration-200'

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h8.76a2 2 0 0 0 1.95-1.57l1.48-6.9H5.12" />
    </svg>
  )
}

function SiteHeader() {
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(getCartItemCount())
  const [user, setUser] = useState(getStoredUser())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    clearSession()
    closeMobileMenu()
    navigate('/')
  }

  const loggedIn = isAuthenticated()

  const linkClassName = ({ isActive }) =>
    `${navLinkBase} ${
      isActive
        ? 'bg-stone-950 text-white shadow-sm'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
    }`
  const mobileLinkClassName = ({ isActive }) =>
    `${mobileLinkBase} ${
      isActive
        ? 'bg-stone-950 text-white shadow-sm'
        : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50'
    }`
  const mobileStaticLinkClassName =
    `${mobileLinkBase} bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50`

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 shadow-[0_10px_35px_rgba(28,25,23,0.05)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="group flex min-w-0 items-center gap-3 rounded-2xl transition"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-stone-950 text-sm font-black text-white shadow-sm transition group-hover:bg-emerald-700">
              MM
            </span>

            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
                Ecommerce
              </p>
              <p className="truncate text-lg font-black text-stone-950">
                Mouha Market
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-950 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-emerald-100 md:hidden"
            aria-label={isMobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">
              {isMobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
            </span>
            <span className="flex h-5 w-5 flex-col justify-center gap-1">
              <span
                className={`h-0.5 w-5 rounded-full bg-current transition ${
                  isMobileMenuOpen ? 'translate-y-1.5 rotate-45' : ''
                }`}
              />
              <span
                className={`h-0.5 w-5 rounded-full bg-current transition ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`h-0.5 w-5 rounded-full bg-current transition ${
                  isMobileMenuOpen ? '-translate-y-1.5 -rotate-45' : ''
                }`}
              />
            </span>
          </button>

          <nav className="hidden flex-1 flex-wrap items-center justify-end gap-1 md:flex lg:gap-2">
            <NavLink to="/" className={linkClassName}>
              Prodotti
            </NavLink>

            {loggedIn && (
              <NavLink to="/my-orders" className={linkClassName}>
                I miei ordini
              </NavLink>
            )}

            {loggedIn && (user?.role === 'admin' || user?.isAdmin) && (
              <NavLink to="/admin" className={linkClassName}>
                Admin
              </NavLink>
            )}

            <NavLink to="/cart" className={linkClassName}>
              <span className="inline-flex items-center gap-2">
                <CartIcon />
                <span>Carrello</span>
                {cartCount > 0 && (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-black text-white">
                    {cartCount}
                  </span>
                )}
              </span>
            </NavLink>

            {loggedIn ? (
              <>
                {user?.name && (
                  <span className="hidden text-sm font-medium text-stone-500 lg:inline">
                    Ciao, {user.name}
                  </span>
                )}

                <button
                  onClick={handleLogout}
                  className="inline-flex min-h-10 items-center rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-stone-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/auth" className={linkClassName}>
                Accedi
              </NavLink>
            )}
          </nav>
        </div>

        {isMobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="mt-3 grid gap-2 border-t border-stone-200/80 pt-3 md:hidden"
          >
            <NavLink to="/" onClick={closeMobileMenu} className={mobileLinkClassName}>
              Prodotti
            </NavLink>

            <Link
              to="/#products"
              onClick={closeMobileMenu}
              className={mobileStaticLinkClassName}
            >
              Catalogo
            </Link>

            <NavLink to="/cart" onClick={closeMobileMenu} className={mobileLinkClassName}>
              <span className="inline-flex items-center gap-2">
                <CartIcon />
                Carrello
              </span>
              {cartCount > 0 && (
                <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-black text-white">
                  {cartCount}
                </span>
              )}
            </NavLink>

            {loggedIn && (
              <NavLink
                to="/my-orders"
                onClick={closeMobileMenu}
                className={mobileLinkClassName}
              >
                I miei ordini
              </NavLink>
            )}

            {loggedIn && (user?.role === 'admin' || user?.isAdmin) && (
              <NavLink to="/admin" onClick={closeMobileMenu} className={mobileLinkClassName}>
                Admin
              </NavLink>
            )}

            {loggedIn ? (
              <>
                <div className="rounded-2xl bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-600 ring-1 ring-stone-200">
                  Profilo{user?.name ? `: ${user.name}` : ''}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-12 items-center rounded-2xl bg-stone-950 px-4 py-3 text-base font-bold text-white transition hover:bg-stone-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/auth" onClick={closeMobileMenu} className={mobileLinkClassName}>
                Accedi
              </NavLink>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

export default SiteHeader
