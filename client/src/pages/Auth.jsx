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
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[32px] bg-stone-900 p-6 text-white shadow-lg sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">
          Accesso rapido
        </p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">
          {mode === 'login' ? 'Bentornato nello shop' : 'Crea il tuo account'}
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-300 sm:text-base">
          Accedi per concludere gli ordini, rivedere lo storico acquisti e mantenere il checkout più lineare su desktop e mobile.
        </p>

        <div className="mt-8 space-y-3 rounded-[28px] bg-white/10 p-5">
          <p className="text-sm font-semibold text-white">Con il tuo account puoi:</p>
          <p className="text-sm text-stone-300">seguire gli ordini, completare il checkout e tornare rapidamente ai prodotti preferiti.</p>
        </div>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Torna alla home
        </Link>
      </div>

      <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setMessage('')
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === 'login'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === 'register'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Registrazione
          </button>
        </div>

        <h2 className="text-2xl font-black text-stone-900">
          {mode === 'login' ? 'Accedi al tuo account' : 'Registrati in pochi secondi'}
        </h2>

        {message && (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
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
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
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
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
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
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
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
