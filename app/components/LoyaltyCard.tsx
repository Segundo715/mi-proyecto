'use client'

import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'

const STAMPS = 5
const BUSINESS_WA = '4471078185' // Número de WhatsApp del negocio (con código de país, sin +)

interface Stamp {
  timestamp: string
  visitsAfter: number
}

interface Customer {
  id: string
  name: string
  phone: string
  visits: number
  confirmed: boolean
  registeredAt: string
  stamps: Stamp[]
}

type Step = 'loading' | 'form' | 'confirm' | 'waiting' | 'card'

export default function LoyaltyCard() {
  const [step, setStep] = useState<Step>('loading')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState<'whatsapp' | 'sms' | null>(null)
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [messageSent, setMessageSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Fallback: si algo falla, mostrar el formulario en 4 segundos
    const fallback = setTimeout(() => setStep(s => s === 'loading' ? 'form' : s), 4000)

    ;(async () => {
      try {
        const confirmedId = localStorage.getItem('loyalty_id')
        const pendingId = localStorage.getItem('loyalty_pending_id')

        if (confirmedId) {
          const r = await fetch(`/api/customers/${confirmedId}`)
          const data: Customer | null = r.ok ? await r.json() : null
          if (data?.confirmed) { setCustomer(data); setStep('card') }
          else { localStorage.removeItem('loyalty_id'); setStep('form') }
        } else if (pendingId) {
          const r = await fetch(`/api/customers/${pendingId}`)
          const data: Customer | null = r.ok ? await r.json() : null
          if (!data) { localStorage.removeItem('loyalty_pending_id'); setStep('form') }
          else if (data.confirmed) {
            localStorage.removeItem('loyalty_pending_id')
            localStorage.setItem('loyalty_id', data.id)
            setCustomer(data); setStep('card')
          } else {
            setCustomer(data); setStep('waiting')
          }
        } else {
          setStep('form')
        }
      } catch {
        setStep('form')
      }
      clearTimeout(fallback)
    })()

    return () => clearTimeout(fallback)
  }, [])

  function validate() {
    const e: { name?: string; phone?: string } = {}
    if (!name.trim()) e.name = 'El nombre es obligatorio'
    if (!phone.trim()) e.phone = 'El teléfono es obligatorio'
    else if (!/^\+?[\d\s\-()]{8,}$/.test(phone.trim()))
      e.phone = 'Número inválido (mín. 8 dígitos)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function chooseMethod(m: 'whatsapp' | 'sms') {
    if (!validate()) return
    setMethod(m)
    setStep('confirm')
  }

  function openConfirmation() {
    const msg = encodeURIComponent(
      `¡Hola! Quiero registrarme en la tarjeta de fidelización ☕\nNombre: ${name}\nTeléfono: ${phone}`
    )
    if (method === 'whatsapp') {
      window.open(`https://wa.me/${BUSINESS_WA}?text=${msg}`, '_blank')
    } else {
      window.open(`sms:?body=${msg}`, '_blank')
    }
    setMessageSent(true)
  }

  async function completeRegistration() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      })
      if (!res.ok) throw new Error()
      const c: Customer = await res.json()
      // Guardamos como pendiente; el empleado manda el link de activación
      localStorage.setItem('loyalty_pending_id', c.id)
      setCustomer(c)
      setStep('waiting')
    } catch {
      alert('Error al registrar. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  async function refreshCard() {
    if (!customer) return
    const res = await fetch(`/api/customers/${customer.id}`)
    if (res.ok) {
      const data: Customer = await res.json()
      setCustomer(data)
      if (data.confirmed && step === 'waiting') {
        localStorage.removeItem('loyalty_pending_id')
        localStorage.setItem('loyalty_id', data.id)
        setStep('card')
      }
    }
  }

  const earned = (customer?.visits ?? 0) >= STAMPS

  // ── Cargando ───────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="fixed inset-0 bg-amber-950 flex flex-col items-center justify-center gap-8">
        <span className="text-6xl animate-pulse">☕</span>
        <button
          onClick={() => setStep('form')}
          className="text-amber-300 text-sm underline"
        >
          Toca aquí si no carga
        </button>
      </div>
    )
  }

  // ── Formulario de registro (no se puede omitir) ───────────────────────────
  if (step === 'form') {
    return (
      <div className="fixed inset-0 z-50 bg-amber-950 flex items-center justify-center p-5">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-amber-800 px-6 py-5 text-center">
            <p className="text-5xl mb-1">☕</p>
            <h1 className="text-white text-xl font-bold">¡Bienvenido!</h1>
            <p className="text-amber-200 text-sm mt-1">
              Regístrate y gana un café gratis por cada 5 visitas
            </p>
          </div>

          <div className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }}
                placeholder="Ej. María González"
                autoComplete="name"
                className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Número de teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: undefined })) }}
                placeholder="Ej. +52 55 1234 5678"
                autoComplete="tel"
                className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <p className="text-xs text-gray-500 text-center pt-1">
              El empleado del negocio te enviará un WhatsApp o SMS para activar tu tarjeta.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => chooseMethod('whatsapp')}
                className="w-full bg-green-500 active:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                💬 Recibir activación por WhatsApp
              </button>
              <button
                onClick={() => chooseMethod('sms')}
                className="w-full bg-blue-500 active:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                ✉️ Recibir activación por SMS
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Confirmar datos antes de enviar (no se puede omitir) ──────────────────
  if (step === 'confirm') {
    return (
      <div className="fixed inset-0 z-50 bg-amber-950 flex items-center justify-center p-5">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-amber-800 px-6 py-5 text-center">
            <p className="text-5xl mb-1">{method === 'whatsapp' ? '💬' : '✉️'}</p>
            <h2 className="text-white text-xl font-bold">Confirma tus datos</h2>
          </div>

          <div className="px-6 py-6 space-y-4">
            <div className="bg-amber-50 rounded-xl p-4 space-y-1 text-sm">
              <p><span className="font-semibold text-amber-900">Nombre:</span> {name}</p>
              <p><span className="font-semibold text-amber-900">Teléfono:</span> {phone}</p>
              <p>
                <span className="font-semibold text-amber-900">Activación:</span>{' '}
                {method === 'whatsapp' ? 'WhatsApp' : 'SMS'}
              </p>
            </div>

            <p className="text-gray-600 text-sm text-center">
              El empleado te mandará el link de activación a este número. ¿Todo correcto?
            </p>

            {!messageSent ? (
              <button
                onClick={openConfirmation}
                className={`w-full font-bold py-4 rounded-xl text-white ${
                  method === 'whatsapp' ? 'bg-green-500 active:bg-green-700' : 'bg-blue-500 active:bg-blue-700'
                }`}
              >
                {method === 'whatsapp' ? '📱 Avisar al empleado por WhatsApp' : '✉️ Avisar al empleado por SMS'}
              </button>
            ) : (
              <button
                onClick={completeRegistration}
                disabled={submitting}
                className="w-full bg-amber-600 active:bg-amber-800 text-white font-bold py-4 rounded-xl disabled:opacity-60"
              >
                {submitting ? 'Registrando...' : '✅ Listo, ya avisé'}
              </button>
            )}

            <button
              onClick={() => { setStep('form'); setMessageSent(false) }}
              className="w-full text-sm text-amber-700 underline py-1"
            >
              ← Corregir datos
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Auto-polling mientras se espera activación (cada 5 segundos)
  useEffect(() => {
    if (step !== 'waiting' || !customer) return
    const interval = setInterval(refreshCard, 5000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, customer?.id])

  // ── Esperando activación del empleado ─────────────────────────────────────
  if (step === 'waiting') {
    return (
      <div className="fixed inset-0 bg-amber-950 flex items-center justify-center p-5">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-amber-800 px-6 py-5 text-center">
            <p className="text-5xl mb-1">⏳</p>
            <h2 className="text-white text-xl font-bold">Activación pendiente</h2>
          </div>

          <div className="px-6 py-6 text-center space-y-4">
            <p className="text-gray-700 text-sm">
              Hola <strong>{customer?.name}</strong>, tu registro fue recibido.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              Muéstrale esta pantalla al empleado para que active tu tarjeta.
            </div>
            <div className="flex items-center justify-center gap-2 text-amber-600 text-sm animate-pulse">
              <span>⏳</span>
              <span>Esperando activación...</span>
            </div>
            <button
              onClick={refreshCard}
              className="w-full bg-amber-700 active:bg-amber-900 text-white font-bold py-3 rounded-xl"
            >
              Verificar ahora
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Tarjeta de fidelización con QR ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="bg-amber-900 rounded-3xl shadow-2xl p-6 text-white">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h2 className="font-bold text-lg">¡Hola, {customer?.name}!</h2>
              <p className="text-amber-300 text-xs">{customer?.phone}</p>
            </div>
            <span className="text-4xl">☕</span>
          </div>
          <p className="text-amber-200 text-xs mb-5 mt-1">Tarjeta de fidelización</p>

          {/* Sellos */}
          <div className="grid grid-cols-5 gap-3 mb-3">
            {Array.from({ length: STAMPS }).map((_, i) => {
              const filled = i < (customer?.visits ?? 0)
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-full flex items-center justify-center text-2xl border-2 transition-all ${
                    filled ? 'bg-amber-500 border-amber-400' : 'bg-amber-800 border-amber-700'
                  }`}
                >
                  {filled ? '☕' : '○'}
                </div>
              )
            })}
          </div>

          <p className="text-center text-amber-300 text-xs mb-5">
            {customer?.visits ?? 0} / {STAMPS} visitas
          </p>

          {/* Código QR del cliente */}
          {customer && (
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center">
              <QRCode
                value={customer.id}
                size={180}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              />
              <p className="text-amber-800 text-xs mt-2 font-semibold text-center">
                Muestra este QR al empleado para sellar tu visita
              </p>
            </div>
          )}
        </div>

        {earned && (
          <div className="bg-yellow-400 text-amber-900 rounded-2xl p-4 text-center font-bold text-base shadow-lg">
            🎉 ¡Tienes un café gratis! Muéstraselo al cajero 🎉
          </div>
        )}

        {!earned && (
          <p className="text-center text-amber-800 text-sm">
            Te {STAMPS - (customer?.visits ?? 0) === 1 ? 'falta' : 'faltan'}{' '}
            <strong>{STAMPS - (customer?.visits ?? 0)}</strong>{' '}
            {STAMPS - (customer?.visits ?? 0) === 1 ? 'visita' : 'visitas'} para tu café gratis
          </p>
        )}

        <button onClick={refreshCard} className="w-full text-amber-700 text-sm underline py-1">
          Actualizar tarjeta
        </button>
      </div>
    </div>
  )
}
