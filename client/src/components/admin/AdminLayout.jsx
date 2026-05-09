import { NavLink, Outlet, useNavigate } from 'react-router-dom'
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
    `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
      isActive
        ? 'bg-stone-950 text-white shadow-sm'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
    }`

  return (
    <div className="min-h-screen bg-stone-100 text-stone-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-stone-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-stone-200 px-6 py-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
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
            className="w-full rounded-lg bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                Admin panel
              </p>
              <p className="mt-1 text-sm font-medium text-stone-500">
                {user?.name ? `Ciao, ${user.name}` : 'Area riservata'}
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${
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
                className="shrink-0 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
