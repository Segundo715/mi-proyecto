'use client'

// Login de RESTA3: usa la misma tabla admins pero emite resta3_session (cookie independiente de admin_session).
import { useState } from 'react'

export default function Resta3LoginPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !password) { setError('Completa todos los campos'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/resta3/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password }),
      })
      if (res.ok) window.location.href = '/resta3'
      else { const d = await res.json(); setError(d.error ?? 'Error') }
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a0d14 0%, #111827 50%, #0a0d14 100%)' }}>

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h18v18H3zM9 9h6M9 12h6M9 15h4"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: '#f1f5f9' }}>
            RESTA<span style={{ color: '#f59e0b' }}>3</span>
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: '#64748b' }}>
            Gestión integral de restaurantes
          </p>
        </div>

        {/* Card login */}
        <div className="rounded-3xl p-6 shadow-2xl"
          style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(245,158,11,0.15)' }}>

          <h2 className="text-base font-bold mb-5" style={{ color: '#94a3b8' }}>Acceso al sistema</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#475569' }}>
                Usuario
              </label>
              <input type="text" value={name} onChange={e => { setName(e.target.value); setError('') }}
                placeholder="Nombre de usuario" autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ backgroundColor: '#0f1117', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.currentTarget.style.borderColor = '#f59e0b'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#475569' }}>
                Contraseña
              </label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ backgroundColor: '#0f1117', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.currentTarget.style.borderColor = '#f59e0b'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide disabled:opacity-60 transition-all mt-2"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#334155' }}>
          RESTA3 · Software de gestión para restaurantes y bares
        </p>
      </div>
    </div>
  )
}
