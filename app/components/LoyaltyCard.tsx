'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CustomerNav from './CustomerNav'

const QRCode = dynamic(() => import('react-qr-code'), { ssr: false })

const STAMPS = 5

interface Customer {
  id: string; name: string; phone: string; visits: number
  confirmed: boolean; registeredAt: string
}

type Step = 'form' | 'card'

export default function LoyaltyCard() {
  const [step, setStep] = useState<Step>('form')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notified, setNotified] = useState(false)

  useEffect(() => {
    localStorage.removeItem('loyalty_pending_id')
    const confirmedId = localStorage.getItem('loyalty_id')
    if (!confirmedId) return
    ;(async () => {
      try {
        const r = await fetch(`/api/customers/${confirmedId}`)
        const data: Customer | null = r.ok ? await r.json() : null
        if (data?.confirmed) { setCustomer(data); setStep('card') }
        else localStorage.removeItem('loyalty_id')
      } catch {}
    })()
  }, [])

  async function handleAuth() {
    if (!name.trim() || !password) { setFormError('Completa todos los campos'); return }
    if (tab === 'register' && !phone.trim()) { setFormError('El teléfono es obligatorio'); return }
    setFormError('')
    setSubmitting(true)
    try {
      const body: Record<string, string> = { action: tab, name: name.trim(), password }
      if (tab === 'register') body.phone = phone.trim()
      const res = await fetch('/api/customer-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const c = await res.json()
      if (!res.ok) { setFormError(c.error ?? 'Error'); return }
      localStorage.setItem('loyalty_id', c.id)
      setCustomer(c)
      setStep('card')
    } catch {
      setFormError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  async function refreshCard() {
    if (!customer) return
    const res = await fetch(`/api/customers/${customer.id}`)
    if (res.ok) setCustomer(await res.json())
  }

  async function notifyEmployee() {
    if (!customer) return
    await fetch(`/api/customers/${customer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkin' }),
    })
    setNotified(true)
    setTimeout(() => setNotified(false), 4000)
  }

  function handleLogout() {
    localStorage.removeItem('loyalty_id')
    setCustomer(null); setName(''); setPhone(''); setPassword(''); setStep('form')
  }

  const earned = (customer?.visits ?? 0) >= STAMPS

  // ── Login / Registro ───────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="fixed inset-0 z-50 bg-amber-950 flex items-center justify-center p-5 pb-20">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-amber-800 px-6 py-5 text-center">
            <p className="text-5xl mb-1">☕</p>
            <h1 className="text-white text-2xl font-bold tracking-wide">Chubis</h1>
            <p className="text-amber-200 text-sm mt-1">5 visitas = 1 café gratis</p>
          </div>

          <div className="flex border-b border-amber-100">
            {(['login', 'register'] as const).map(t => (
              <button key={t} type="button" onClick={() => { setTab(t); setFormError('') }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === t ? 'text-amber-800 border-b-2 border-amber-700' : 'text-gray-400'}`}>
                {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          <div className="px-6 py-5 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">Nombre</label>
              <input type="text" value={name} onChange={e => { setName(e.target.value); setFormError('') }}
                placeholder="Ej. María González" autoComplete="username"
                className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500" />
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-1">Teléfono</label>
                <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setFormError('') }}
                  placeholder="Ej. 55 1234 5678" autoComplete="tel"
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500" />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setFormError('') }}
                placeholder="Contraseña" autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500" />
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{formError}</div>
            )}

            <button type="button" onClick={handleAuth} disabled={submitting}
              className="w-full bg-amber-700 active:bg-amber-900 text-white font-bold py-3 rounded-xl disabled:opacity-60">
              {submitting ? 'Cargando...' : tab === 'login' ? '☕ Entrar' : '☕ Crear cuenta'}
            </button>
          </div>
        </div>
        <CustomerNav active="card" />
      </div>
    )
  }

  // ── Tarjeta de fidelización ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-amber-50 pb-20">
      <div className="bg-amber-900 text-white">
        <div className="max-w-sm mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-base">☕ Chubis</h1>
          <button type="button" onClick={handleLogout} className="text-sm text-amber-300 underline">Salir</button>
        </div>
      </div>

      <div className="max-w-sm mx-auto p-4 space-y-4">
        <div className="bg-amber-900 rounded-3xl shadow-2xl p-6 text-white">
          <div className="flex justify-between items-start mb-1">
            <h2 className="font-bold text-lg">¡Hola, {customer?.name}!</h2>
            <span className="text-4xl">☕</span>
          </div>
          {customer?.phone && <p className="text-amber-300 text-xs mb-1">{customer.phone}</p>}
          <p className="text-amber-200 text-xs mb-5">Tarjeta Chubis</p>

          <div className="grid grid-cols-5 gap-3 mb-3">
            {Array.from({ length: STAMPS }).map((_, i) => {
              const filled = i < (customer?.visits ?? 0)
              return (
                <div key={i} className={`aspect-square rounded-full flex items-center justify-center text-2xl border-2 transition-all ${filled ? 'bg-amber-500 border-amber-400' : 'bg-amber-800 border-amber-700'}`}>
                  {filled ? '☕' : '○'}
                </div>
              )
            })}
          </div>

          <p className="text-center text-amber-300 text-xs mb-5">{customer?.visits ?? 0} / {STAMPS} visitas</p>

          {customer && (
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center">
              <QRCode value={customer.id} size={180} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
              <p className="text-amber-800 text-xs mt-2 font-semibold text-center">
                Muestra este QR al empleado para sellar tu visita
              </p>
            </div>
          )}
        </div>

        {earned ? (
          <div className="bg-yellow-400 text-amber-900 rounded-2xl p-4 text-center font-bold text-base shadow-lg">
            🎉 ¡Tienes un café gratis! Muéstraselo al cajero 🎉
          </div>
        ) : (
          <p className="text-center text-amber-800 text-sm">
            Te {STAMPS - (customer?.visits ?? 0) === 1 ? 'falta' : 'faltan'}{' '}
            <strong>{STAMPS - (customer?.visits ?? 0)}</strong>{' '}
            {STAMPS - (customer?.visits ?? 0) === 1 ? 'visita' : 'visitas'} para tu café gratis
          </p>
        )}

        <button type="button" onClick={notifyEmployee}
          className={`w-full font-bold py-3 rounded-xl transition-colors ${notified ? 'bg-green-500 text-white' : 'bg-amber-700 active:bg-amber-900 text-white'}`}>
          {notified ? '✅ Empleado notificado' : '🔔 Avisar al empleado'}
        </button>

        <button type="button" onClick={refreshCard} className="w-full text-amber-700 text-sm underline py-1">
          Actualizar tarjeta
        </button>
      </div>

      <CustomerNav active="card" />
    </div>
  )
}
