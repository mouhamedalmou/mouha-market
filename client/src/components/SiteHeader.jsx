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
const mobileLinkBase =
  'flex min-h-12 items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold transition'

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
        ? 'bg-stone-900 text-white shadow-sm'
        : 'bg-white/80 text-stone-700 hover:bg-white'
    }`
  const mobileLinkClassName = ({ isActive }) =>
    `${mobileLinkBase} ${
      isActive
        ? 'bg-stone-900 text-white shadow-sm'
        : 'bg-white/85 text-stone-700 hover:bg-white'
    }`
  const mobileStaticLinkClassName =
    `${mobileLinkBase} bg-white/85 text-stone-700 hover:bg-white`

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" onClick={closeMobileMenu} className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-400 text-sm font-black text-stone-900 shadow-sm">
              MM
            </span>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-700">
                Ecommerce
              </p>
              <p className="truncate text-lg font-semibold text-stone-900">
                Mouha Market
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-900 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 md:hidden"
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

          <nav className="hidden flex-1 flex-wrap items-center justify-end gap-2 md:flex lg:gap-3">
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
                Carrello
                {cartCount > 0 && (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-stone-900">
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
          </nav>
        </div>

        {isMobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="mt-4 grid gap-2 border-t border-stone-200/70 pt-4 md:hidden"
          >
            <NavLink to="/" onClick={closeMobileMenu} className={mobileLinkClassName}>
              Home
            </NavLink>

            <Link
              to="/#products"
              onClick={closeMobileMenu}
              className={mobileStaticLinkClassName}
            >
              Products
            </Link>

            <NavLink to="/cart" onClick={closeMobileMenu} className={mobileLinkClassName}>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-stone-900">
                  {cartCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/my-orders"
              onClick={closeMobileMenu}
              className={mobileLinkClassName}
            >
              Orders
            </NavLink>

            {loggedIn && (user?.role === 'admin' || user?.isAdmin) && (
              <NavLink to="/admin" onClick={closeMobileMenu} className={mobileLinkClassName}>
                Admin
              </NavLink>
            )}

            {loggedIn ? (
              <>
                <div className="rounded-2xl bg-white/85 px-4 py-3 text-sm font-semibold text-stone-600">
                  Profile{user?.name ? `: ${user.name}` : ''}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-12 items-center rounded-2xl bg-stone-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-stone-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/auth" onClick={closeMobileMenu} className={mobileLinkClassName}>
                Login
              </NavLink>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

export default SiteHeader
