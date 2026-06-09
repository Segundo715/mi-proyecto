'use client'

// Configuración de branding exclusivo para RESTA3 (logo, color de acento, nombre en sidebar).
// Guarda bajo las claves resta3_logo, resta3_accent, resta3_name en la tabla settings.
// Si están vacías, RESTA3 usa los valores generales del restaurante como fallback.
import { useState, useEffect, useRef } from 'react'
import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)',
  text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)',
}

const PALETTE = ['#f59e0b', '#00e676', '#3b82f6', '#a855f7', '#ef4444', '#ec4899', '#06b6d4', '#f97316', '#10b981', '#8b5cf6']

const NAV_PREVIEW = ['Dashboard', 'TPV / Caja', 'Mesas', 'Cocina', 'Inventario']

export default function AdminResta3ConfigPage() {
  const [logo, setLogo] = useState('')
  const [accent, setAccent] = useState('#f59e0b')
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [generalLogo, setGeneralLogo] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/settings?key=resta3_logo').then(r => r.json()),
      fetch('/api/settings?key=resta3_accent').then(r => r.json()),
      fetch('/api/settings?key=resta3_name').then(r => r.json()),
      fetch('/api/settings?key=profile_logo').then(r => r.json()),
    ]).then(([l, a, n, gl]) => {
      setLogo(l.value ?? '')
      setAccent(a.value ?? '#f59e0b')
      setName(n.value ?? '')
      setGeneralLogo(gl.value ?? '')
    })
  }, [])

  async function uploadLogo(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/settings/upload', { method: 'POST', body: fd })
    if (r.ok) {
      const d = await r.json()
      setLogo(d.url)
    }
    setUploading(false)
  }

  async function save() {
    setSaving(true)
    await Promise.all([
      fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'resta3_logo',   value: logo }) }),
      fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'resta3_accent', value: accent }) }),
      fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'resta3_name',   value: name }) }),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const previewLogo = logo || generalLogo

  return (
    <div className="min-h-screen md:ml-[240px] md:pt-16" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[700px] mx-auto p-4 space-y-4">

        {/* Header */}
        <div className="pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>
            Personalización <span style={{ color: S.accent }}>RESTA3</span>
          </h1>
          <p className="text-xs mt-0.5" style={{ color: S.sub }}>
            Logo, colores y nombre propios para el panel del personal. Si se dejan vacíos, se usan los del restaurante.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Columna izquierda: formulario */}
          <div className="space-y-4">

            {/* Logo */}
            <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <h2 className="font-bold text-sm" style={{ color: S.text }}>Logo de RESTA3</h2>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ border: `2px dashed ${S.border}`, backgroundColor: S.bg }}>
                  {previewLogo
                    ? <img src={previewLogo} alt="" className="w-full h-full object-contain p-2" />
                    : <span className="text-3xl">🖼️</span>}
                </div>
                <div className="space-y-2 flex-1">
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 transition-all"
                    style={{ backgroundColor: 'var(--ad-accent)', color: '#000' }}>
                    {uploading ? 'Subiendo...' : '↑ Subir imagen'}
                  </button>
                  {logo && (
                    <button onClick={() => setLogo('')}
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                      ✕ Quitar logo personalizado
                    </button>
                  )}
                  <p className="text-[11px]" style={{ color: S.sub }}>
                    {logo ? 'Logo personalizado activo' : 'Usando logo del restaurante'}
                  </p>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = '' }} />
            </div>

            {/* Nombre */}
            <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <h2 className="font-bold text-sm" style={{ color: S.text }}>Nombre en el sidebar</h2>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Dejar vacío para usar el nombre del restaurante"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }} />
            </div>

            {/* Color de acento */}
            <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <h2 className="font-bold text-sm" style={{ color: S.text }}>Color de acento</h2>

              {/* Paleta rápida */}
              <div className="flex gap-2 flex-wrap">
                {PALETTE.map(c => (
                  <button key={c} onClick={() => setAccent(c)}
                    className="w-8 h-8 rounded-full transition-all"
                    style={{
                      backgroundColor: c,
                      outline: accent === c ? `3px solid ${c}` : 'none',
                      outlineOffset: '2px',
                      transform: accent === c ? 'scale(1.15)' : 'scale(1)',
                    }} />
                ))}
              </div>

              {/* Color picker + hex */}
              <div className="flex items-center gap-3">
                <input type="color" value={accent} onChange={e => setAccent(e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer border-0 p-1 flex-shrink-0"
                  style={{ backgroundColor: S.bg }} />
                <div>
                  <p className="font-black text-base" style={{ color: accent }}>{accent.toUpperCase()}</p>
                  <p className="text-xs" style={{ color: S.sub }}>Color de links activos y botones</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: vista previa */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <h2 className="font-bold text-sm mb-4" style={{ color: S.text }}>Vista previa del sidebar</h2>

              <div className="rounded-xl overflow-hidden w-full max-w-[200px] mx-auto"
                style={{ backgroundColor: 'var(--ad-sidebar)', border: '1px solid var(--ad-border)' }}>

                {/* Logo area */}
                <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--ad-border)' }}>
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg,${accent},#06b6d4)` }}>
                    {previewLogo
                      ? <img src={previewLogo} alt="" className="w-full h-full object-contain" />
                      : <span className="text-lg font-black" style={{ color: '#000' }}>R</span>}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold truncate" style={{ color: 'var(--ad-text)' }}>
                      {name || 'Mi Restaurante'}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--ad-sub)' }}>RESTA3</div>
                  </div>
                </div>

                {/* Nav items */}
                {NAV_PREVIEW.map((label, i) => (
                  <div key={label}
                    className="flex items-center gap-3 px-3 py-2 text-xs mx-2 my-0.5 rounded-lg font-medium"
                    style={i === 0
                      ? { backgroundColor: accent, color: accent === '#fff' ? '#000' : '#000', fontWeight: 700 }
                      : { color: 'var(--ad-sub)' }}>
                    <div className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: i === 0 ? 'rgba(0,0,0,0.4)' : 'var(--ad-sub)', opacity: 0.6 }} />
                    {label}
                  </div>
                ))}

                {/* Footer preview */}
                <div className="px-3 py-3 mt-1" style={{ borderTop: '1px solid var(--ad-border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg,${accent},#06b6d4)` }}>
                      {previewLogo
                        ? <img src={previewLogo} alt="" className="w-full h-full object-contain" />
                        : <span className="text-sm font-black" style={{ color: '#000' }}>R</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--ad-text)' }}>{name || 'Mi Restaurante'}</p>
                      <p className="text-[10px]" style={{ color: 'var(--ad-sub)' }}>Panel de gestión</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nota */}
            <div className="rounded-xl p-4 text-xs space-y-1.5"
              style={{ backgroundColor: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)' }}>
              <p className="font-bold" style={{ color: 'var(--ad-accent)' }}>¿Cómo funciona?</p>
              <p style={{ color: S.sub }}>Los cambios aquí solo afectan a RESTA3. El panel del admin mantiene su propia configuración.</p>
              <p style={{ color: S.sub }}>Si dejas el logo vacío, RESTA3 usa el logo del restaurante configurado en <strong>Configuración general</strong>.</p>
            </div>
          </div>
        </div>

        {/* Guardar */}
        <button onClick={save} disabled={saving}
          className="w-full py-4 rounded-2xl font-black text-base disabled:opacity-60 transition-all"
          style={{ backgroundColor: 'var(--ad-accent)', color: '#000' }}>
          {saving ? 'Guardando...' : saved ? '✓ Cambios guardados' : 'Guardar cambios en RESTA3'}
        </button>

      </div>
    </div>
  )
}
