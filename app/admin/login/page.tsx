'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim() || !password) { setError('Completa todos los campos'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: tab, name: name.trim(), password }),
      })
      const data = await res.json()
      if (res.ok) window.location.href = '/admin'
      else setError(data.error ?? 'Error al iniciar sesión')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const INPUT = 'w-full border-2 border-amber-200 rounded-2xl px-4 py-3.5 text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-amber-500 text-sm transition-colors'

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-5"
      style={{ background: 'linear-gradient(160deg, #1c0a03 0%, #431c0d 50%, #78350f 100%)' }}>

      {/* Brand */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-amber-800 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl shadow-amber-950/50">
          ☕
        </div>
        <h1 className="text-white text-3xl font-black tracking-tight">Chubis</h1>
        <p className="text-amber-400 text-sm mt-1 font-medium">Panel de empleados</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex p-1.5 gap-1.5 bg-amber-50 m-4 rounded-2xl">
          {(['login', 'register'] as const).map(t => (
            <button key={t} type="button"
              onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                tab === t ? 'bg-amber-900 text-white shadow-sm' : 'text-amber-700 hover:bg-amber-100'
              }`}>
              {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1.5 uppercase tracking-wide">Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Ej. Carlos" autoComplete="username" autoFocus className={INPUT} />
          </div>
          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1.5 uppercase tracking-wide">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              className={INPUT} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-amber-900 active:bg-amber-950 text-white font-black py-4 rounded-2xl text-base disabled:opacity-60 transition-colors mt-1">
            {loading ? 'Cargando...' : tab === 'login' ? '→ Entrar' : '→ Crear cuenta'}
          </button>
        </form>
      </div>

      <p className="text-amber-700 text-xs mt-6">Solo para uso del personal</p>
    </div>
  )
}
