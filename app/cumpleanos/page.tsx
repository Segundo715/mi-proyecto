'use client'

import { useState } from 'react'

const TERMINOS = `Al registrarte aceptas que usemos tu nombre, número de WhatsApp y fecha de nacimiento únicamente para enviarte una felicitación o promoción especial en tu cumpleaños. No compartiremos tus datos con terceros. Puedes solicitar la eliminación de tus datos en cualquier momento contactándonos directamente.`

const PRIVACIDAD = `Tu información personal (nombre, teléfono y fecha de nacimiento) se almacena de forma segura y se usa exclusivamente para el programa de cumpleaños. No realizamos publicidad no solicitada ni vendemos datos personales. En cumplimiento de la legislación aplicable puedes ejercer tus derechos de acceso, rectificación y cancelación contactando al restaurante.`

type Step = 'form' | 'success'

export default function CumpleanosPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<'terminos' | 'privacidad' | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !birthdate) {
      setError('Por favor completa todos los campos.'); return
    }
    if (!accepted) {
      setError('Debes aceptar los términos y condiciones.'); return
    }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/cumpleanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), birthdate }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Error al registrar. Intenta de nuevo.')
      } else {
        setStep('success')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-white">
              {modal === 'terminos' ? 'Términos y Condiciones' : 'Política de Privacidad'}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
              {modal === 'terminos' ? TERMINOS : PRIVACIDAD}
            </p>
            <button onClick={() => setModal(null)}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ backgroundColor: '#6366f1', color: '#fff' }}>
              Entendido
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {step === 'form' ? (
          <div className="rounded-3xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Header */}
            <div className="text-center p-8 pb-6"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <div className="text-5xl mb-3">🎂</div>
              <h1 className="text-2xl font-black text-white">Club de Cumpleaños</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Regístrate y recibe una sorpresa especial en tu día
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                  style={{ backgroundColor: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="10 dígitos"
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                  style={{ backgroundColor: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={e => setBirthdate(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                  style={{ backgroundColor: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                />
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 shrink-0"
                  style={{ accentColor: '#6366f1' }}
                />
                <label htmlFor="terms" className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                  Acepto los{' '}
                  <button type="button" onClick={() => setModal('terminos')}
                    className="underline font-semibold" style={{ color: '#818cf8' }}>
                    Términos y Condiciones
                  </button>
                  {' '}y la{' '}
                  <button type="button" onClick={() => setModal('privacidad')}
                    className="underline font-semibold" style={{ color: '#818cf8' }}>
                    Política de Privacidad
                  </button>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-black text-sm disabled:opacity-60 transition-all"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
                {loading ? 'Registrando...' : '🎉 ¡Regístrame!'}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden shadow-2xl text-center"
            style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="p-8"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <div className="text-6xl mb-3">🎉</div>
              <h2 className="text-2xl font-black text-white">¡Ya eres parte del club!</h2>
            </div>
            <div className="p-8 space-y-3">
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                Hola <strong style={{ color: '#f1f5f9' }}>{name}</strong>, te avisaremos por WhatsApp cuando llegue tu día especial con una sorpresa de nuestra parte. 🎂
              </p>
              <p className="text-xs" style={{ color: '#64748b' }}>Puedes cerrar esta página.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
