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

const RATING_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: 'Siguiente visita', color: 'text-gray-400' },
  2: { text: '2 visitas más',    color: 'text-amber-600' },
  3: { text: '¡Ya casi!',        color: 'text-amber-500' },
  4: { text: '1 visita más',     color: 'text-green-500' },
  5: { text: '¡Café gratis!',    color: 'text-yellow-500' },
}

export default function LoyaltyCard() {
  const [step, setStep] = useState<Step>('form')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
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
    setFormError('')
    setSubmitting(true)
    try {
      const body: Record<string, string> = { action: tab, name: name.trim(), password }
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
    setCustomer(null); setName(''); setPassword(''); setStep('form')
  }

  const earned = (customer?.visits ?? 0) >= STAMPS
  const visits = customer?.visits ?? 0
  const progress = Math.min((visits / STAMPS) * 100, 100)

  const INPUT = 'w-full border-2 border-amber-200 rounded-2xl px-4 py-3.5 text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-amber-500 text-sm'

  // ── LOGIN / REGISTRO ─────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-950 to-amber-900 flex flex-col items-center justify-center p-5 pb-24">
        {/* Brand above card */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">☕</div>
          <h1 className="text-white text-3xl font-black tracking-tight">Chubis</h1>
          <p className="text-amber-300 text-sm mt-1 font-medium">5 visitas = 1 café gratis</p>
        </div>

        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex p-1.5 gap-1.5 bg-amber-50 m-4 rounded-2xl">
            {(['login', 'register'] as const).map(t => (
              <button key={t} type="button"
                onClick={() => { setTab(t); setFormError('') }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  tab === t
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'text-amber-700 hover:bg-amber-100'
                }`}>
                {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          <div className="px-5 pb-5 space-y-3">
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1.5 uppercase tracking-wide">Nombre</label>
              <input type="text" value={name} onChange={e => { setName(e.target.value); setFormError('') }}
                placeholder="Ej. María González" autoComplete="username" className={INPUT} />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1.5 uppercase tracking-wide">Contraseña</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setFormError('') }}
                placeholder="••••••••" autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                className={INPUT} />
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">{formError}</div>
            )}

            <button type="button" onClick={handleAuth} disabled={submitting}
              className="w-full bg-amber-800 active:bg-amber-950 text-white font-black py-4 rounded-2xl text-base disabled:opacity-60 transition-colors mt-1">
              {submitting ? 'Cargando...' : tab === 'login' ? '☕ Entrar' : '☕ Crear cuenta'}
            </button>
          </div>
        </div>

        <CustomerNav active="card" />
      </div>
    )
  }

  // ── TARJETA DE FIDELIZACIÓN ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      {/* Header */}
      <div className="bg-amber-900 text-white shadow-lg">
        <div className="max-w-sm mx-auto px-4 py-3.5 flex items-center justify-between">
          <span className="font-black text-base tracking-tight">☕ Chubis</span>
          <button type="button" onClick={handleLogout}
            className="text-xs text-amber-300 bg-amber-800 px-3 py-1.5 rounded-full font-semibold active:bg-amber-700">
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-sm mx-auto p-4 space-y-4">

        {/* Physical card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #431c0d 0%, #7c2d12 50%, #92400e 100%)' }}>

          {/* Card top */}
          <div className="px-6 pt-6 pb-4 flex justify-between items-start">
            <div>
              <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-0.5">Tarjeta Chubis</p>
              <p className="text-white text-xl font-black leading-tight">¡Hola, {customer?.name?.split(' ')[0]}!</p>
              {customer?.phone && <p className="text-amber-400 text-xs mt-0.5">{customer.phone}</p>}
            </div>
            <div className="text-4xl opacity-90">☕</div>
          </div>

          {/* Stamps */}
          <div className="px-6 pb-2">
            <div className="flex gap-2.5 mb-2">
              {Array.from({ length: STAMPS }).map((_, i) => {
                const filled = i < visits
                return (
                  <div key={i}
                    className={`flex-1 aspect-square rounded-full flex items-center justify-center text-xl border-2 transition-all ${
                      filled
                        ? 'bg-amber-400 border-amber-300 shadow-lg shadow-amber-900/40'
                        : 'bg-amber-900/60 border-amber-700/50'
                    }`}>
                    {filled ? '☕' : <span className="w-2 h-2 rounded-full bg-amber-700/60 block" />}
                  </div>
                )
              })}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-amber-900/50 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-amber-400 text-xs text-right font-medium mb-4">{visits} / {STAMPS} visitas</p>
          </div>

          {/* QR */}
          {customer && (
            <div className="mx-5 mb-5 bg-white rounded-2xl p-4 flex flex-col items-center">
              <QRCode value={customer.id} size={160} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
              <p className="text-amber-800 text-xs mt-2.5 font-semibold text-center">
                Muestra este QR al empleado para sellar tu visita
              </p>
            </div>
          )}
        </div>

        {/* Status message */}
        {earned ? (
          <div className="bg-gradient-to-r from-yellow-400 to-amber-400 text-amber-900 rounded-2xl p-5 text-center shadow-lg">
            <p className="text-3xl mb-1">🎉</p>
            <p className="font-black text-lg">¡Café gratis disponible!</p>
            <p className="text-sm font-medium opacity-80">Muéstraselo al cajero</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="text-3xl">{'☕'.repeat(Math.max(0, STAMPS - visits)).slice(0, 3) || '🎯'}</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">
                {STAMPS - visits === 1 ? 'Te falta 1 visita' : `Te faltan ${STAMPS - visits} visitas`}
              </p>
              <p className="text-xs text-gray-500">para tu café gratis</p>
            </div>
          </div>
        )}

        {/* Notify button */}
        <button type="button" onClick={notifyEmployee}
          className={`w-full font-black py-4 rounded-2xl text-base transition-all shadow-md ${
            notified
              ? 'bg-green-500 text-white scale-95'
              : 'bg-amber-800 active:bg-amber-950 text-white'
          }`}>
          {notified ? '✅ ¡Empleado avisado!' : '🔔 Avisar al empleado'}
        </button>

        <button type="button" onClick={refreshCard}
          className="w-full text-amber-700 text-sm font-medium py-2 flex items-center justify-center gap-1.5">
          <span className="text-base">↻</span> Actualizar tarjeta
        </button>
      </div>

      <CustomerNav active="card" />
    </div>
  )
}
