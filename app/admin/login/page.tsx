'use client'

import { useState } from 'react'

export default function LoginPage() {
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
        body: JSON.stringify({ action: 'login', name: name.trim(), password }),
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

  const INPUT = 'w-full border border-[#B90F45]/40 rounded-2xl px-4 py-3.5 text-white bg-[#1a1a1a] placeholder-gray-500 focus:outline-none focus:border-[#B90F45] text-sm transition-colors'

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-5" style={{ backgroundColor: '#000000' }}>

      {/* Brand */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl overflow-hidden"
          style={{ backgroundColor: '#0d0d0d', border: '2px solid #B90F45' }}>
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-2" />
        </div>
        <p className="text-sm mt-1 font-medium" style={{ color: '#B90F45' }}>Panel de empleados</p>
      </div>

      <div className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        <p className="text-center text-xs font-bold uppercase tracking-widest pt-5 pb-1" style={{ color: '#B90F45' }}>Iniciar sesión</p>

        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Ej. Carlos" autoComplete="username" autoFocus className={INPUT} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" className={INPUT} />
          </div>

          {error && (
            <div className="border rounded-2xl px-4 py-3 text-sm font-medium text-red-300" style={{ backgroundColor: '#2d0a0a', borderColor: '#7f1d1d' }}>{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full text-white font-black py-4 rounded-2xl text-base disabled:opacity-60 transition-colors mt-1"
            style={{ backgroundColor: '#B90F45' }}>
            {loading ? 'Cargando...' : '→ Entrar'}
          </button>
        </form>
      </div>

      <p className="text-xs mt-6" style={{ color: '#B90F45' }}>Solo para uso del personal</p>
    </div>
  )
}
