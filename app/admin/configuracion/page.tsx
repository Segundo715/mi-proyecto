'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)',
  text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)',
}

const SETTINGS = [
  { key: 'registro_titulo',    label: 'Título de bienvenida',   placeholder: '¡Bienvenido!',             hint: 'Aparece en la tarjeta de /registro' },
  { key: 'registro_subtitulo', label: 'Subtítulo de bienvenida', placeholder: 'Completa tus datos para registrarte...', hint: 'Texto debajo del título en /registro' },
]

export default function AdminConfiguracionPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    SETTINGS.forEach(async s => {
      const r = await fetch(`/api/settings?key=${s.key}`)
      const d = await r.json()
      if (d.value) setValues(p => ({ ...p, [s.key]: d.value }))
    })
  }, [])

  async function saveSetting(key: string) {
    setSaving(key)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: values[key] ?? '' }),
    })
    setSaving(null)
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  return (
    <div className="min-h-screen md:ml-[240px] md:pt-16" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[800px] mx-auto p-4 space-y-4">

        <div className="pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>Configuración</h1>
          <p className="text-xs mt-0.5" style={{ color: S.sub }}>Textos y personalización del sistema</p>
        </div>

        {/* Textos del formulario de registro */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
            <p className="font-bold text-sm" style={{ color: S.text }}>Formulario de Registro (/registro)</p>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Texto que ven los clientes al escanear el QR del restaurante</p>
          </div>
          <div className="p-5 space-y-4">
            {SETTINGS.map(s => (
              <div key={s.key}>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>{s.label}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={values[s.key] ?? ''}
                    onChange={e => setValues(p => ({ ...p, [s.key]: e.target.value }))}
                    placeholder={s.placeholder}
                    className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
                    style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }}
                  />
                  <button
                    onClick={() => saveSetting(s.key)}
                    disabled={saving === s.key}
                    className="px-4 py-2 rounded-2xl text-sm font-bold shrink-0 transition-all"
                    style={{ backgroundColor: saved === s.key ? 'rgba(0,230,118,.2)' : `${S.accent}22`, color: saved === s.key ? '#4ade80' : S.accent }}>
                    {saving === s.key ? '...' : saved === s.key ? '✓ Guardado' : 'Guardar'}
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: S.sub }}>{s.hint}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
