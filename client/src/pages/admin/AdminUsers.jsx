import { useCallback, useEffect, useMemo, useState } from 'react'
import EmptyState from '../../components/admin/EmptyState'
import LoadingSpinner from '../../components/admin/LoadingSpinner'
import StatCard from '../../components/admin/StatCard'
import StatusBadge from '../../components/admin/StatusBadge'
import Toast from '../../components/admin/Toast'
import api from '../../services/api'
import { formatCurrency, formatOrderDate } from '../../utils/formatters'

const PAGE_SIZE = 10

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
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
          Users
        </p>
        <h1 className="mt-2 text-3xl font-black text-stone-950">Gestione utenti</h1>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Users" value={users.length} helper="Account registrati" />
        <StatCard label="Admins" value={adminCount} helper="Accesso admin" tone="sky" />
        <StatCard
          label="Customer Revenue"
          value={formatCurrency(totalSpent)}
          helper={`${customerCount} clienti`}
          tone="emerald"
        />
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={event => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search utenti o email"
            className="rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500"
          />
          <select
            value={roleFilter}
            onChange={event => {
              setRoleFilter(event.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-stone-200 px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-emerald-500"
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
        <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
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

          <div className="flex flex-col gap-3 border-t border-stone-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-stone-500">
              Pagina {page} di {totalPages} · {filteredUsers.length} utenti
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default AdminUsers
