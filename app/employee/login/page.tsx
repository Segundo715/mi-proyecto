'use client'

// POST /api/employee/auth escribe la cookie httpOnly employee_session en éxito.
import { useState } from 'react'

export default function EmployeeLoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
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
      const res = await fetch('/api/employee/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: mode, name: name.trim(), password }),
      })
      const data = await res.json()
      if (res.ok) window.location.href = '/employee'
      else setError(data.error ?? 'Error al iniciar sesión')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const INPUT = 'w-full rounded-2xl px-4 py-3.5 text-white text-sm transition-colors focus:outline-none'

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-5" style={{ backgroundColor: '#060911' }}>

      {/* Brand */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#00e676,#06b6d4)' }}>
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-2" />
        </div>
        <div className="font-extrabold text-xl tracking-wide" style={{ color: '#eef2f7' }}>NICHO</div>
        <p className="text-sm mt-1 font-medium" style={{ color: '#00e676' }}>Panel de empleados</p>
      </div>

      <div className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#0e1225', border: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Mode toggle */}
        <div className="flex p-2 gap-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} type="button" onClick={() => { setMode(m); setError('') }}
              className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors"
              style={mode === m
                ? { backgroundColor: '#00e676', color: '#000' }
                : { color: '#6b7a94', backgroundColor: 'transparent' }}>
              {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-4 space-y-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#6b7a94' }}>Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Ej. Carlos" autoComplete="username" autoFocus
              className={INPUT}
              style={{ backgroundColor: '#0a0e1c', border: '1px solid rgba(0,230,118,0.3)' }}
              onFocus={e => e.currentTarget.style.borderColor = '#00e676'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,230,118,0.3)'} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#6b7a94' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              className={INPUT}
              style={{ backgroundColor: '#0a0e1c', border: '1px solid rgba(0,230,118,0.3)' }}
              onFocus={e => e.currentTarget.style.borderColor = '#00e676'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,230,118,0.3)'} />
          </div>

          {error && (
            <div className="border rounded-2xl px-4 py-3 text-sm font-medium text-red-300"
              style={{ backgroundColor: '#2d0a0a', borderColor: '#7f1d1d' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full font-black py-4 rounded-2xl text-base disabled:opacity-60 transition-colors mt-1"
            style={{ backgroundColor: '#00e676', color: '#000' }}>
            {loading ? 'Cargando...' : mode === 'login' ? '→ Entrar' : '→ Crear cuenta'}
          </button>
        </form>
      </div>

      <p className="text-xs mt-6" style={{ color: '#6b7a94' }}>Solo para uso del personal</p>
    </div>
  )
}
