import { useCallback, useEffect, useMemo, useState } from 'react'
import EmptyState from '../../components/admin/EmptyState'
import LoadingSpinner from '../../components/admin/LoadingSpinner'
import StatCard from '../../components/admin/StatCard'
import StatusBadge from '../../components/admin/StatusBadge'
import Toast from '../../components/admin/Toast'
import api from '../../services/api'
import { formatCurrency, formatOrderDate } from '../../utils/formatters'

const PAGE_SIZE = 10

function PaginationControls({ page, totalPages, totalItems, onPrevious, onNext }) {
  return (
    <div className="grid min-w-0 grid-cols-[1fr_auto] items-center gap-2 border-t border-stone-200 px-2.5 py-2 sm:px-4 sm:py-2.5">
      <p className="min-w-0 truncate text-xs font-semibold text-stone-500 sm:text-sm">
        {page}/{totalPages} · {totalItems} utenti
      </p>
      <div className="flex min-w-0 gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={onPrevious}
          className="min-h-8 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-black text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-9 sm:px-3 sm:py-1.5"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page === totalPages}
          onClick={onNext}
          className="min-h-8 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-black text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-9 sm:px-3 sm:py-1.5"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function UserMobileCard({ user }) {
  return (
    <article className="w-full min-w-0 max-w-full rounded-2xl border border-stone-200/80 bg-white p-2.5 shadow-sm">
      <div className="min-w-0 border-b border-stone-100 pb-2">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-stone-950">
              {user.name || 'Utente'}
            </p>
            <p className="mt-0.5 truncate text-xs font-medium text-stone-500">
              {user.email}
            </p>
          </div>
          <div className="shrink-0">
            <StatusBadge value={user.role} />
          </div>
        </div>
      </div>

      <div className="mt-2 grid min-w-0 grid-cols-1 gap-1.5 rounded-2xl bg-stone-50 p-2 ring-1 ring-stone-100 min-[360px]:grid-cols-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
            Ordini
          </p>
          <p className="mt-0.5 truncate text-sm font-black text-stone-950">
            {user.orderCount}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
            Speso
          </p>
          <p className="mt-0.5 truncate text-sm font-black text-emerald-700">
            {formatCurrency(user.totalSpent)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
            Iscritto
          </p>
          <p className="mt-0.5 truncate text-xs font-bold text-stone-600">
            {formatOrderDate(user.createdAt)}
          </p>
        </div>
      </div>
    </article>
  )
}

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Errore nel recupero utenti',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return users.filter(user => {
      const matchesSearch =
        !normalizedSearch ||
        `${user.name} ${user.email}`.toLowerCase().includes(normalizedSearch)
      const matchesRole = roleFilter === 'all' || user.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const adminCount = users.filter(user => user.role === 'admin').length
  const customerCount = users.filter(user => user.role !== 'admin').length
  const totalSpent = users.reduce((sum, user) => sum + Number(user.totalSpent || 0), 0)

  if (loading) {
    return <LoadingSpinner label="Caricamento utenti..." />
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-x-hidden">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
          Users
        </p>
        <h1 className="mt-1 text-2xl font-black text-stone-950 sm:mt-2 sm:text-3xl">
          Gestione utenti
        </h1>
      </section>

      <section className="grid gap-2 sm:gap-4 md:grid-cols-3">
        <StatCard label="Total Users" value={users.length} helper="Account registrati" />
        <StatCard label="Admins" value={adminCount} helper="Accesso admin" tone="sky" />
        <StatCard
          label="Customer Revenue"
          value={formatCurrency(totalSpent)}
          helper={`${customerCount} clienti`}
          tone="emerald"
        />
      </section>

      <section className="rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_12px_35px_rgba(28,25,23,0.05)] sm:rounded-3xl sm:p-4">
        <div className="grid gap-2 sm:gap-3 lg:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={event => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search utenti o email"
            className="min-h-10 min-w-0 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
          />
          <select
            value={roleFilter}
            onChange={event => {
              setRoleFilter(event.target.value)
              setPage(1)
            }}
            className="min-h-10 min-w-0 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-bold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
          >
            <option value="all">Tutti i ruoli</option>
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>
        </div>
      </section>

      {filteredUsers.length === 0 ? (
        <EmptyState
          title="Nessun utente trovato"
          message="Modifica ricerca o filtro ruolo per visualizzare altri account."
        />
      ) : (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_14px_45px_rgba(28,25,23,0.07)] sm:rounded-3xl">
          <div className="grid min-w-0 gap-2 p-2 md:hidden">
            {paginatedUsers.map(user => (
              <UserMobileCard key={user.id} user={user} />
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-stone-200 text-sm">
              <thead className="bg-stone-50 text-left text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total Spent</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedUsers.map(user => (
                  <tr key={user.id} className="align-middle">
                    <td className="px-4 py-3 font-black text-stone-950">{user.name}</td>
                    <td className="px-4 py-3 font-medium text-stone-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={user.role} />
                    </td>
                    <td className="px-4 py-3 font-bold text-stone-700">
                      {user.orderCount}
                    </td>
                    <td className="px-4 py-3 font-black text-emerald-700">
                      {formatCurrency(user.totalSpent)}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {formatOrderDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            onPrevious={() => setPage(prev => Math.max(1, prev - 1))}
            onNext={() => setPage(prev => Math.min(totalPages, prev + 1))}
          />
        </section>
      )}
    </div>
  )
}

export default AdminUsers
