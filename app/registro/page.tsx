'use client'

import { useState } from 'react'

type Step = 'form' | 'success'

export default function RegistroPage() {
  const [step, setStep] = useState<Step>('form')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [birth, setBirth] = useState('')
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!name.trim()) { setError('Ingresa tu nombre completo'); return }
    if (!phone.trim()) { setError('Ingresa tu número de WhatsApp'); return }
    if (!birth) { setError('Ingresa tu fecha de nacimiento'); return }
    if (!terms) { setError('Debes aceptar los términos y condiciones'); return }
    setError('')
    setSubmitting(true)
    try {
      const age = birth ? Math.floor((Date.now() - new Date(birth).getTime()) / (365.25 * 86400000)) : undefined
      const res = await fetch('/api/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), age }),
      })
      if (res.ok) {
        setStep('success')
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

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="w-full max-w-sm text-center space-y-6">
          <img src="/logo.png" alt="NICHO" className="h-24 w-auto mx-auto" />
          <div className="rounded-3xl p-8 space-y-3" style={{ backgroundColor: '#1a1a1a', border: '1px solid #B90F45' }}>
            <div className="text-5xl">☕</div>
            <h2 className="text-2xl font-black text-white">¡Bienvenido!</h2>
            <p className="text-sm" style={{ color: '#aaa' }}>
              Tu registro fue exitoso. Ya eres parte de la comunidad NICHO.
            </p>
            <p className="text-xs font-bold" style={{ color: '#B90F45' }}>
              Acumula 5 visitas y gana un café gratis ☕
            </p>
          </div>
          <button onClick={() => { setStep('form'); setName(''); setPhone(''); setBirth(''); setTerms(false) }}
            className="text-sm font-semibold" style={{ color: '#B90F45' }}>
            Registrar otra persona
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Header rojo */}
      <div className="relative flex flex-col items-center pt-10 pb-6 px-4"
        style={{ background: 'linear-gradient(180deg, #B90F45 0%, #7a0a2e 70%, #0d0d0d 100%)' }}>
        <img src="/logo.png" alt="NICHO" className="h-20 w-auto mb-3" />
        <p className="text-white font-black text-base tracking-widest text-center">Únete a nuestra comunidad</p>
      </div>

      {/* Formulario */}
      <div className="flex-1 px-5 pb-10 max-w-sm mx-auto w-full space-y-5 pt-4">

        {/* Bienvenida */}
        <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#111', border: '1px solid #B90F45' }}>
          <p className="font-black text-white text-base">¡Bienvenido!</p>
          <p className="text-xs mt-1" style={{ color: '#aaa' }}>
            Completa tus datos para registrarte. La información será guardada de forma segura.
          </p>
        </div>

        {/* Nombre */}
        <div>
          <label className="flex items-center gap-2 text-sm font-black text-white mb-2">
            <span style={{ color: '#B90F45' }}>👤</span> Nombre Completo *
          </label>
          <input
            type="text" value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="Ej: Juan Pérez García"
            className="w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder-gray-500 outline-none"
            style={{ backgroundColor: '#1a1a1a', border: '1.5px solid #333' }}
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="flex items-center gap-2 text-sm font-black text-white mb-2">
            <span style={{ color: '#B90F45' }}>📱</span> Número de WhatsApp *
          </label>
          <input
            type="tel" value={phone}
            onChange={e => { setPhone(e.target.value); setError('') }}
            placeholder="Ej: 443 123 4567"
            className="w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder-gray-500 outline-none"
            style={{ backgroundColor: '#1a1a1a', border: '1.5px solid #333' }}
          />
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label className="flex items-center gap-2 text-sm font-black text-white mb-2">
            <span style={{ color: '#B90F45' }}>🎂</span> Fecha de Nacimiento *
          </label>
          <input
            type="date" value={birth}
            onChange={e => { setBirth(e.target.value); setError('') }}
            className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
            style={{ backgroundColor: '#1a1a1a', border: '1.5px solid #333', color: birth ? '#fff' : '#6b7280', colorScheme: 'dark' }}
          />
        </div>

        {/* Términos */}
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5 shrink-0">
            <input type="checkbox" checked={terms} onChange={e => { setTerms(e.target.checked); setError('') }} className="sr-only" />
            <div className="w-5 h-5 rounded flex items-center justify-center border-2 transition-all"
              style={{ backgroundColor: terms ? '#B90F45' : 'transparent', borderColor: terms ? '#B90F45' : '#555' }}>
              {terms && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>}
            </div>
          </div>
          <p className="text-xs" style={{ color: '#aaa' }}>
            He leído y acepto los{' '}
            <span className="font-bold" style={{ color: '#B90F45' }}>términos y condiciones</span>
            {' '}y la{' '}
            <span className="font-bold" style={{ color: '#B90F45' }}>política de privacidad</span> *
          </p>
        </label>

        {/* Error */}
        {error && (
          <div className="rounded-2xl px-4 py-3 text-sm font-medium text-red-300"
            style={{ backgroundColor: '#2d0a0a', border: '1px solid #7f1d1d' }}>{error}</div>
        )}

        {/* Botón */}
        <button
          onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 rounded-2xl text-white font-black text-base disabled:opacity-60 transition-all"
          style={{ backgroundColor: '#B90F45' }}>
          {submitting ? 'Registrando...' : '☕ Unirme a NICHO'}
        </button>
      </div>
    </div>
  )
}
