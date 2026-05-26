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

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#000' }}>
      <div className="flex flex-col items-center px-4 pt-6">
        {/* ── TARJETA ── */}
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl mb-4"
          style={{ background: 'linear-gradient(135deg, #1a0010 0%, #B90F45 60%, #DC5E86 100%)' }}>

          {/* Logo + nombre restaurante */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
            <span className="text-white font-black text-base tracking-wide">NICHO</span>
          </div>

          {/* Imagen con sellos superpuestos */}
          <div className="relative" style={{ height: '170px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/uploads/menu/SalmonBowl.jpeg" alt=""
              className="w-full h-full object-cover" />
            {/* Sellos encima de la imagen */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 px-6">
              {Array.from({ length: STAMPS }).map((_, i) => {
                const filled = i < visits
                return (
                  <div key={i}
                    className="flex-1 aspect-square rounded-full flex items-center justify-center border-2 transition-all"
                    style={{
                      backgroundColor: filled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.18)',
                      borderColor: filled ? 'white' : 'rgba(255,255,255,0.45)',
                      backdropFilter: 'blur(3px)',
                      boxShadow: filled ? '0 0 14px rgba(255,255,255,0.5)' : 'none',
                    }}>
                    {filled && <img src="/logo.png" alt="" className="w-3/4 h-3/4 object-contain" />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Oferta + contador sellos */}
          <div className="flex items-start gap-3 px-5 py-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#f9c6d5' }}>Oferta de recompensa</p>
              <p className="text-white text-sm font-semibold mt-0.5">
                Cada {STAMPS} visitas, 1 gratis ☕
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#f9c6d5' }}>Sellos · Premios</p>
              <p className="text-white text-sm font-black mt-0.5">
                {visits}/{STAMPS} · {earned ? '1' : '0'}
              </p>
            </div>
          </div>

          {/* QR */}
          <div className="mx-5 mb-5 bg-white rounded-2xl p-4 flex flex-col items-center">
            <QRCode value={customer!.id} size={110} style={{ height: 'auto', maxWidth: '200px', width: '100%' }} />
            <p className="text-xs mt-2.5 font-semibold text-center" style={{ color: '#B90F45' }}>
              {earned ? '🎉 ¡Café gratis! Muéstraselo al cajero' : 'Muestra este QR al empleado'}
            </p>
          </div>
        </div>
      </div>

      <CustomerNav active="card" />
    </div>
  )
}
