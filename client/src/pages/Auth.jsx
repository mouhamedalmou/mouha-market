import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { persistSession } from '../services/session'

function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'register') {
        await api.post('/auth/register', form)
        setMessage('Account creato. Ora puoi effettuare il login')
        setMode('login')
        setForm(prev => ({ ...prev, password: '' }))
        return
      }

      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      })

      persistSession({
        token: res.data.token,
        user: res.data.user,
      })

      navigate(res.data.user?.role === 'admin' || res.data.user?.isAdmin ? '/admin' : '/')
    } catch (err) {
      console.error(err)
      setMessage(err.response?.data?.message || 'Errore durante l\'autenticazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <div className="rounded-3xl bg-stone-950 p-6 text-white shadow-[0_24px_80px_rgba(28,25,23,0.18)] sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
          Accesso rapido
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
          {mode === 'login' ? 'Bentornato nello shop' : 'Crea il tuo account'}
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-300 sm:text-base">
          Accedi per concludere gli ordini, rivedere lo storico acquisti e mantenere il checkout più lineare su desktop e mobile.
        </p>

        <div className="mt-8 space-y-3 rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
          <p className="text-sm font-bold text-white">Con il tuo account puoi:</p>
          <p className="text-sm text-stone-300">seguire gli ordini, completare il checkout e tornare rapidamente ai prodotti preferiti.</p>
        </div>

        <Link
          to="/"
          className="mt-6 inline-flex min-h-12 items-center rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
        >
          Torna alla home
        </Link>
      </div>

      <div className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_22px_70px_rgba(28,25,23,0.10)] sm:p-8">
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setMessage('')
            }}
            className={`min-h-11 rounded-xl px-4 py-2 text-sm font-bold transition ${
              mode === 'login'
                ? 'bg-white text-stone-950 shadow-sm'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register')
              setMessage('')
            }}
            className={`min-h-11 rounded-xl px-4 py-2 text-sm font-bold transition ${
              mode === 'register'
                ? 'bg-white text-stone-950 shadow-sm'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            Registrazione
          </button>
        </div>

        <h2 className="text-2xl font-black text-stone-950">
          {mode === 'login' ? 'Accedi al tuo account' : 'Registrati in pochi secondi'}
        </h2>

        {message && (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 ring-1 ring-amber-100">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700" htmlFor="name">
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
                className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {loading
              ? 'Attendere...'
              : mode === 'login'
                ? 'Entra'
                : 'Crea account'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Auth
