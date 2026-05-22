'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CustomerNav from '@/app/components/CustomerNav'

const QRCode = dynamic(() => import('react-qr-code'), { ssr: false })

const STORAGE_KEY = 'loyalty_card_id'
const STAMPS = 5

interface Customer {
  id: string; name: string; phone: string; visits: number; confirmed: boolean
}

type Step = 'form' | 'card'

const INPUT = 'w-full border border-[#B90F45]/40 rounded-2xl px-4 py-3.5 text-white bg-[#1a1a1a] placeholder-gray-500 focus:outline-none focus:border-[#B90F45] text-sm transition-colors'

export default function CardPage() {
  const [step, setStep] = useState<Step>('form')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    fetch(`/api/loyalty/${saved}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) { setCustomer(data); setStep('card') } })
      .catch(() => {})
  }, [])

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) { setError('Completa todos los campos'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      })
      if (res.ok) {
        const data: Customer = await res.json()
        localStorage.setItem(STORAGE_KEY, data.id)
        setCustomer(data)
        setStep('card')
      } else {
        const d = await res.json()
        setError(d.error ?? 'Error al registrar')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY)
    setStep('form')
    setCustomer(null)
    setName('')
    setPhone('')
  }

  if (step === 'form') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-5" style={{ backgroundColor: '#000' }}>
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-20 w-auto mx-auto mb-3" />
          <p className="text-sm font-medium" style={{ color: '#B90F45' }}>{STAMPS} visitas = 1 café gratis</p>
        </div>

        <div className="w-full max-w-sm rounded-3xl shadow-2xl p-5 space-y-3" style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a' }}>
          <p className="text-center text-xs font-bold uppercase tracking-widest pb-1" style={{ color: '#B90F45' }}>Accede a tu tarjeta</p>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Nombre</label>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Ej. María González" autoFocus className={INPUT} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Teléfono</label>
            <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setError('') }}
              placeholder="Ej. 55 1234 5678" className={INPUT} />
          </div>

          {error && (
            <div className="rounded-2xl px-4 py-3 text-sm font-medium text-red-300"
              style={{ backgroundColor: '#2d0a0a', border: '1px solid #7f1d1d' }}>{error}</div>
          )}

          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="w-full text-white font-black py-4 rounded-2xl text-base disabled:opacity-60 transition-colors"
            style={{ backgroundColor: '#B90F45' }}>
            {submitting ? 'Cargando...' : 'Ver mi tarjeta'}
          </button>
        </div>

        <CustomerNav active="card" />
      </div>
    )
  }

  const visits = customer?.visits ?? 0
  const earned = visits >= STAMPS
  const progress = Math.min((visits / STAMPS) * 100, 100)

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#000' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 shadow-lg" style={{ backgroundColor: '#000', borderBottom: '1px solid #B90F45' }}>
        <div className="max-w-sm mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-black text-base tracking-tight text-white">Mi Tarjeta</span>
          </div>
          <button type="button" onClick={handleLogout}
            className="text-xs text-white px-3 py-1.5 rounded-full font-semibold"
            style={{ backgroundColor: '#B90F45' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center px-4 pt-4">
        {/* Tarjeta con imagen de fondo interna */}
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl mb-4 relative">
          {/* Imagen de fondo dentro de la tarjeta */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uploads/menu/SalmonBowl.jpeg" alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.35 }} />
          {/* Overlay de color de la tarjeta */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(26,0,16,0.85) 0%, rgba(185,15,69,0.80) 60%, rgba(220,94,134,0.80) 100%)' }} />

          {/* Contenido de la tarjeta */}
          <div className="relative z-10">
            <div className="px-6 pt-6 pb-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#f9c6d5' }}>Tarjeta de Lealtad</p>
              <p className="text-white text-xl font-black">¡Hola, {customer?.name?.split(' ')[0]}!</p>
              {customer?.phone && <p className="text-xs mt-0.5" style={{ color: '#f9c6d5' }}>{customer.phone}</p>}
            </div>

            {/* Sellos */}
            <div className="px-6 pb-2">
              <div className="flex gap-2.5 mb-2">
                {Array.from({ length: STAMPS }).map((_, i) => {
                  const filled = i < visits
                  return (
                    <div key={i} className="flex-1 aspect-square rounded-full flex items-center justify-center border-2 transition-all"
                      style={{
                        backgroundColor: filled ? 'white' : 'rgba(255,255,255,0.1)',
                        borderColor: filled ? 'white' : 'rgba(255,255,255,0.2)',
                        boxShadow: filled ? '0 0 12px rgba(255,255,255,0.3)' : 'none',
                      }}>
                      {filled
                        ? <img src="/logo.png" alt="" className="w-4/5 h-4/5 object-contain" />
                        : <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />}
                    </div>
                  )
                })}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: 'white' }} />
              </div>
              <p className="text-xs text-right font-medium mb-4" style={{ color: '#f9c6d5' }}>{visits} / {STAMPS} visitas</p>
            </div>

            {/* QR */}
            <div className="mx-5 mb-5 bg-white rounded-2xl p-4 flex flex-col items-center">
              <QRCode value={customer!.id} size={150} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
              <p className="text-xs mt-2.5 font-semibold text-center" style={{ color: '#B90F45' }}>
                {earned ? '🎉 ¡Café gratis! Muéstraselo al cajero' : 'Muestra este QR al empleado para sellar tu visita'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CustomerNav active="card" />
    </div>
  )
}
