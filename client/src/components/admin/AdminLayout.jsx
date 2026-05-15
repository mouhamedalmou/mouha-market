import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearSession, getStoredUser } from '../../services/session'

const navItems = [
  { label: 'Dashboard', to: '/admin', end: true },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Users', to: '/admin/users' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const user = getStoredUser()

  const handleLogout = () => {
    clearSession()
    navigate('/')
  }

  const navClassName = ({ isActive }) =>
    `flex min-h-11 items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
      isActive
        ? 'bg-stone-950 text-white shadow-sm'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
    }`

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f7f4] text-stone-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-stone-200/80 bg-white/95 shadow-[10px_0_40px_rgba(28,25,23,0.04)] backdrop-blur lg:flex lg:flex-col">
        <div className="border-b border-stone-200 px-6 py-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
            Mouha Market
          </p>
          <h1 className="mt-2 text-2xl font-black text-stone-950">Admin</h1>
          {user?.email && (
            <p className="mt-2 truncate text-sm font-medium text-stone-500">
              {user.email}
            </p>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4 py-5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navClassName}
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-stone-200 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-11 w-full rounded-2xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-72">
        <header className="sticky top-0 z-20 overflow-x-hidden border-b border-stone-200/80 bg-white/90 px-3 py-3 shadow-[0_10px_35px_rgba(28,25,23,0.04)] backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:flex-1">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700 sm:tracking-[0.22em]">
                  Admin panel
                </p>
                <p className="mt-1 truncate text-sm font-medium text-stone-500">
                  {user?.name ? `Ciao, ${user.name}` : 'Area riservata'}
                </p>
              </div>

              <Link
                to="/"
                className="inline-flex min-h-10 w-fit items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
              >
                ← Back to Home
              </Link>
            </div>

            <div className="grid max-w-full grid-cols-2 gap-2 lg:hidden">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `min-h-10 min-w-0 truncate rounded-full px-3 py-2 text-center text-sm font-bold ${
                      isActive
                        ? 'bg-stone-950 text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="col-span-2 min-h-10 rounded-full bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 overflow-x-hidden px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
