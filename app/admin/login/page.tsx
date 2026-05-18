'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.replace('/admin')
      } else {
        const data = await res.json()
        setError(data.error ?? 'Error al iniciar sesión')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-amber-950 flex items-center justify-center p-5">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-amber-800 px-6 py-6 text-center">
          <p className="text-5xl mb-2">☕</p>
          <h1 className="text-white text-xl font-bold">Panel del empleado</h1>
          <p className="text-amber-200 text-sm mt-1">Acceso exclusivo para staff</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña"
              autoComplete="current-password"
              className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-700 active:bg-amber-900 text-white font-bold py-3 rounded-xl disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
