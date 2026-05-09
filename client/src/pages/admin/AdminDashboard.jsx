import { useCallback, useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import EmptyState from '../../components/admin/EmptyState'
import LoadingSpinner from '../../components/admin/LoadingSpinner'
import StatCard from '../../components/admin/StatCard'
import StatusBadge from '../../components/admin/StatusBadge'
import Toast from '../../components/admin/Toast'
import api from '../../services/api'
import { formatCurrency, formatOrderDate } from '../../utils/formatters'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/stats')
      setStats(res.data)
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Errore nel recupero dashboard',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  if (loading) {
    return <LoadingSpinner label="Caricamento dashboard..." />
  }

  const chartData =
    stats?.monthlyRevenue?.length > 0
      ? stats.monthlyRevenue
      : [{ month: 'N/A', revenue: 0, orders: 0 }]

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-black text-stone-950">
            Admin Dashboard
          </h1>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders || 0}
          helper="Ordini registrati"
          tone="stone"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          helper="Totale lordo ordini"
          tone="emerald"
        />
        <StatCard
          label="Total Products"
          value={stats?.totalProducts || 0}
          helper="Prodotti in catalogo"
          tone="sky"
        />
        <StatCard
          label="Pending Orders"
          value={stats?.pendingOrders || 0}
          helper="Da lavorare"
          tone="amber"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                Revenue chart
              </p>
              <h2 className="mt-1 text-xl font-black text-stone-950">
                Ricavi per mese
              </h2>
            </div>
          </div>

          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#78716c' }}
                  tickFormatter={value => formatCurrency(value).replace(',00', '')}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Orders',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#059669"
                  strokeWidth={3}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
            Recent orders
          </p>
          <h2 className="mt-1 text-xl font-black text-stone-950">Ultimi ordini</h2>

          <div className="mt-5 space-y-3">
            {stats?.recentOrders?.length > 0 ? (
              stats.recentOrders.map(order => (
                <article
                  key={order._id}
                  className="rounded-lg border border-stone-100 bg-stone-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-stone-950">
                        #{order._id.slice(-7).toUpperCase()}
                      </p>
                      <p className="mt-1 truncate text-xs font-medium text-stone-500">
                        {order.user?.name || 'Cliente rimosso'}
                      </p>
                    </div>
                    <StatusBadge value={order.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold text-emerald-700">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <span className="text-xs font-medium text-stone-500">
                      {formatOrderDate(order.createdAt)}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Nessun ordine"
                message="Gli ordini recenti appariranno qui appena arrivano."
              />
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default AdminDashboard
