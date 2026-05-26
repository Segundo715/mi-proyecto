'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CustomerNav from '@/app/components/CustomerNav'
import { RewardIcon } from '@/app/components/RewardIcon'

const QRCode = dynamic(() => import('react-qr-code'), { ssr: false })

const STORAGE_KEY = 'loyalty_descuento_id'
const CATEGORIES_KEY = 'reward_categories'
const CATEGORY_ID = 'descuento'

// Config por defecto de la "Tarjeta Descuento" (se sobreescribe desde /admin/tarjetas)
const DEFAULT_DESC = {
  name: 'Descuento Directo', reward: '20% de descuento', icon: 'percent', color: '#fb923c',
  iconColor: '#ffffff', logo: '/logo.png', image: '/uploads/menu/SalmonBowl.jpeg',
  brandText: 'NICHO', brandLogo: '',
}

interface PromoConfig {
  name: string; reward: string; icon: string; color: string
  iconColor: string; logo: string; image: string; brandText: string; brandLogo: string
}

interface Customer {
  id: string; name: string; phone: string; visits: number; confirmed: boolean
}

type Step = 'form' | 'card'

// Extrae el porcentaje del texto del premio (ej. "20% de descuento" -> "20")
function percentOf(reward: string): string | null {
  const m = reward.match(/(\d+)\s*%/)
  return m ? m[1] : null
}

export default function CardDescuentoPage() {
  const [step, setStep] = useState<Step>('form')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cfg, setCfg] = useState<PromoConfig>(DEFAULT_DESC)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      fetch(`/api/loyalty/${saved}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) { setCustomer(data); setStep('card') } })
        .catch(() => {})
    }
    // Cargar parámetros de la categoría "Descuento" desde /admin/tarjetas
    fetch(`/api/settings?key=${CATEGORIES_KEY}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.value) return
        const list = JSON.parse(d.value)
        const promo = Array.isArray(list) ? list.find((c: PromoConfig & { id: string }) => c.id === CATEGORY_ID) : null
        if (promo) setCfg({
          name: promo.name ?? DEFAULT_DESC.name,
          reward: promo.reward ?? DEFAULT_DESC.reward,
          icon: promo.icon ?? DEFAULT_DESC.icon,
          color: promo.color ?? DEFAULT_DESC.color,
          iconColor: promo.iconColor || DEFAULT_DESC.iconColor,
          logo: promo.logo || DEFAULT_DESC.logo,
          image: promo.image || DEFAULT_DESC.image,
          brandText: promo.brandText || DEFAULT_DESC.brandText,
          brandLogo: promo.brandLogo || DEFAULT_DESC.brandLogo,
        })
      })
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

  const pct = percentOf(cfg.reward)

  if (step === 'form') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-5" style={{ backgroundColor: '#000' }}>
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cfg.logo} alt="Logo" className="h-20 w-auto mx-auto mb-3" />
          <p className="text-sm font-medium inline-flex items-center gap-1.5 justify-center" style={{ color: cfg.color }}>
            {pct ? `${pct}% de descuento` : cfg.reward}
            <RewardIcon name={cfg.icon} size={16} style={{ color: cfg.iconColor }} />
          </p>
        </div>

        <div className="w-full max-w-sm rounded-3xl shadow-2xl p-5 space-y-3" style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a' }}>
          <p className="text-center text-xs font-bold uppercase tracking-widest pb-1" style={{ color: cfg.color }}>Activa tu descuento</p>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Nombre</label>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Ej. María González" autoFocus
              className="w-full rounded-2xl px-4 py-3.5 text-white bg-[#1a1a1a] placeholder-gray-500 focus:outline-none text-sm transition-colors"
              style={{ border: `1px solid ${cfg.color}66` }} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Teléfono</label>
            <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setError('') }}
              placeholder="Ej. 55 1234 5678"
              className="w-full rounded-2xl px-4 py-3.5 text-white bg-[#1a1a1a] placeholder-gray-500 focus:outline-none text-sm transition-colors"
              style={{ border: `1px solid ${cfg.color}66` }} />
          </div>

          {error && (
            <div className="rounded-2xl px-4 py-3 text-sm font-medium text-red-300"
              style={{ backgroundColor: '#2d0a0a', border: '1px solid #7f1d1d' }}>{error}</div>
          )}

          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="w-full text-white font-black py-4 rounded-2xl text-base disabled:opacity-60 transition-colors"
            style={{ backgroundColor: cfg.color }}>
            {submitting ? 'Cargando...' : 'Ver mi descuento'}
          </button>
        </div>

        <CustomerNav active="card" />
      </div>
    )
  }

  const redeemed = (customer?.visits ?? 0) >= 1
  const lightColor = `color-mix(in srgb, ${cfg.color} 55%, #fff)`

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#000' }}>
      <div className="flex flex-col items-center px-4 pt-6">
        {/* ── TARJETA ── */}
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl mb-4"
          style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${cfg.color} 25%, #000) 0%, ${cfg.color} 60%, ${lightColor} 100%)` }}>

          {/* Logo + marca */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cfg.logo} alt="Logo" className="h-10 w-auto object-contain" />
            {cfg.brandLogo
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={cfg.brandLogo} alt="Marca" className="h-8 w-auto object-contain" />
              : <span className="text-white font-black text-base tracking-wide">{cfg.brandText}</span>}
          </div>

          {/* Imagen con badge de descuento (sin sellos) */}
          <div className="relative" style={{ height: '170px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cfg.image} alt="" className="w-full h-full object-cover" />
            {/* Velo + badge */}
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.32)' }}>
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(4px)' }}>
                <RewardIcon name={cfg.icon} size={32} style={{ color: '#fff' }} />
                {pct ? (
                  <div className="flex items-baseline gap-1 text-white">
                    <span className="font-black text-5xl leading-none tracking-tight">{pct}</span>
                    <span className="font-black text-2xl leading-none">%</span>
                  </div>
                ) : (
                  <span className="text-white font-black text-2xl leading-tight">{cfg.reward}</span>
                )}
              </div>
            </div>
            {/* Estado canjeado */}
            {redeemed && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}>
                ✓ Usado
              </div>
            )}
          </div>

          {/* Promoción + estado (un solo escaneo) */}
          <div className="flex items-start gap-3 px-5 py-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: lightColor }}>Descuento</p>
              <p className="text-white text-sm font-semibold mt-0.5 inline-flex items-center gap-1.5">
                {cfg.reward}
                <RewardIcon name={cfg.icon} size={15} style={{ color: cfg.iconColor }} />
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: lightColor }}>Canje</p>
              <p className="text-white text-sm font-black mt-0.5">{redeemed ? 'Usado' : '1 escaneo'}</p>
            </div>
          </div>

          {/* QR */}
          <div className="mx-5 mb-5 bg-white rounded-2xl p-4 flex flex-col items-center"
            style={{ opacity: redeemed ? 0.55 : 1 }}>
            <QRCode value={customer!.id} size={110} style={{ height: 'auto', maxWidth: '200px', width: '100%' }} />
            <p className="text-xs mt-2.5 font-semibold text-center" style={{ color: cfg.color }}>
              {redeemed
                ? '🎉 ¡Descuento aplicado! Gracias por tu visita'
                : `Muestra este QR al empleado para tu ${pct ? `${pct}% de descuento` : 'descuento'}`}
            </p>
          </div>
        </div>

        <p className="text-xs text-center max-w-sm" style={{ color: '#666' }}>
          Cupón de un solo uso. Válido para una compra con descuento en {cfg.brandText || 'el local'}.
        </p>
      </div>

      <CustomerNav active="card" />
    </div>
  )
}
