'use client'

// Gestión de slides TV para el empleado: puede activar/desactivar slides pero no editar contenido.
import { useState, useEffect } from 'react'
import EmployeeNav from '@/app/components/EmployeeNav'
import { Icon } from '@/app/components/Icon'

interface TVSlide {
  id: string
  title: string
  subtitle?: string
  price?: string
  imageUrl?: string
  isOffer: boolean
  order: number
  active: boolean
  createdAt: string
}

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  price: '',
  imageUrl: '',
  isOffer: false,
  active: true,
}

const S = {
  bg:     '#080b16',
  card:   '#0e1225',
  accent: '#00e676',
  text:   '#eef2f7',
  sub:    '#6b7a94',
  border: 'rgba(255,255,255,0.07)',
  input:  '#0a0e1c',
}

const inputStyle = { backgroundColor: S.input, color: S.text, border: `1px solid rgba(0,230,118,0.25)` }
const INPUT_CLS = 'w-full rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors'

export default function EmployeeTVPage() {
  const [slides, setSlides] = useState<TVSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const [previewSlide, setPreviewSlide] = useState<TVSlide | null>(null)

  useEffect(() => {
    fetchSlides()
  }, [])

  async function fetchSlides() {
    setLoading(true)
    try {
      const res = await fetch('/api/tv')
      if (res.ok) {
        const data: TVSlide[] = await res.json()
        setSlides(data)
        if (data.length > 0 && !previewSlide) setPreviewSlide(data[0])
      }
    } finally {
      setLoading(false)
    }
  }

  async function createSlide() {
    if (!form.title.trim()) { setFormError('El título es obligatorio.'); return }
    setFormError('')
    setSaving(true)
    try {
      const res = await fetch('/api/tv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || undefined,
          price: form.price.trim() || undefined,
          imageUrl: form.imageUrl.trim() || undefined,
          isOffer: form.isOffer,
          active: form.active,
        }),
      })
      if (res.ok) { setForm(EMPTY_FORM); fetchSlides() }
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(slide: TVSlide) {
    await fetch(`/api/tv/${slide.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !slide.active }),
    })
    fetchSlides()
  }

  async function moveSlide(slide: TVSlide, direction: 'up' | 'down') {
    const sorted = [...slides].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex(s => s.id === slide.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const other = sorted[swapIdx]
    await Promise.all([
      fetch(`/api/tv/${slide.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: other.order }) }),
      fetch(`/api/tv/${other.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: slide.order }) }),
    ])
    fetchSlides()
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/tv/upload', { method: 'POST', body: fd })
      if (res.ok) { const { url } = await res.json(); setForm(p => ({ ...p, imageUrl: url })) }
    } finally {
      setUploading(false)
    }
  }

  async function deleteSlide(id: string) {
    if (!confirm('¿Eliminar este slide?')) return
    await fetch(`/api/tv/${id}`, { method: 'DELETE' })
    if (previewSlide?.id === id) setPreviewSlide(null)
    fetchSlides()
  }

  const sortedSlides = [...slides].sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <EmployeeNav />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-black" style={{ color: S.text }}>Pantalla de TV</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: form + list */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <h2 className="font-bold text-lg" style={{ color: S.accent }}>Añadir slide</h2>

              {formError && (
                <div className="border rounded-xl px-4 py-2 text-sm"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: '#fca5a5' }}>
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: S.sub }}>Título *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ej. Café del día" className={INPUT_CLS} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: S.sub }}>Subtítulo (opcional)</label>
                <input type="text" value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Ej. Recién tostado" className={INPUT_CLS} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: S.sub }}>Precio (opcional)</label>
                <input type="text" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  placeholder="Ej. $50" className={INPUT_CLS} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: S.sub }}>Imagen (opcional)</label>
                <input type="file" accept="image/*" onChange={handleImageUpload}
                  className={INPUT_CLS + ' file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold'}
                  style={inputStyle} />
                {uploading && <p className="text-xs mt-1" style={{ color: S.accent }}>Subiendo imagen...</p>}
                {form.imageUrl && (
                  <div className="mt-2 relative inline-block">
                    <img src={form.imageUrl} alt="preview" className="h-20 rounded-xl object-cover" />
                    <button type="button" onClick={() => setForm(p => ({ ...p, imageUrl: '' }))}
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center leading-none rounded-full"
                      style={{ backgroundColor: '#ef4444', color: '#fff' }}>×</button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="slideOffer" checked={form.isOffer}
                  onChange={e => setForm(p => ({ ...p, isOffer: e.target.checked }))}
                  className="w-4 h-4" style={{ accentColor: S.accent }} />
                <label htmlFor="slideOffer" className="text-sm font-medium" style={{ color: S.text }}>
                  Es oferta / promoción (2x1, descuento…)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="slideActive" checked={form.active}
                  onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4" style={{ accentColor: S.accent }} />
                <label htmlFor="slideActive" className="text-sm font-medium" style={{ color: S.text }}>Activo</label>
              </div>

              <button onClick={createSlide} disabled={saving}
                className="w-full font-bold py-3 rounded-xl disabled:opacity-60 transition-colors"
                style={{ backgroundColor: S.accent, color: '#000' }}>
                {saving ? 'Guardando...' : '+ Añadir slide'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-10" style={{ color: S.accent }}>Cargando...</div>
            ) : sortedSlides.length === 0 ? (
              <div className="flex flex-col items-center py-10" style={{ color: S.sub }}>
                <span className="mb-2"><Icon name="tv" size={34} /></span>
                <p>No hay slides aún</p>
              </div>
            ) : (
              sortedSlides.map((slide, idx) => (
                <div key={slide.id}
                  className="rounded-2xl p-4 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: S.card,
                    border: previewSlide?.id === slide.id ? `2px solid ${S.accent}` : `1px solid ${S.border}`,
                  }}
                  onClick={() => setPreviewSlide(slide)}>
                  <div className="flex items-start gap-3">
                    {slide.imageUrl && (
                      <img src={slide.imageUrl} alt={slide.title} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: 'rgba(0,230,118,0.15)', color: S.accent }}>#{idx + 1}</span>
                        <p className="font-bold truncate" style={{ color: S.text }}>{slide.title}</p>
                      </div>
                      {slide.subtitle && <p className="text-sm truncate" style={{ color: S.sub }}>{slide.subtitle}</p>}
                      {slide.price && <p className="text-sm font-bold" style={{ color: S.accent }}>{slide.price}</p>}
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={slide.active
                            ? { backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                            : { backgroundColor: 'rgba(255,255,255,0.08)', color: S.sub }}>
                          {slide.active ? 'Activo' : 'Inactivo'}
                        </span>
                        {slide.isOffer
                          ? <span className="text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1"
                              style={{ backgroundColor: 'rgba(251,146,60,0.15)', color: '#fb923c' }}><Icon name="tag" size={11} /> Oferta · 30s</span>
                          : <span className="text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1"
                              style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}><Icon name="image" size={11} /> Imagen · 15s</span>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={e => { e.stopPropagation(); moveSlide(slide, 'up') }} disabled={idx === 0}
                      className="px-3 py-1.5 rounded-xl text-sm disabled:opacity-30"
                      style={{ border: `1px solid ${S.border}`, color: S.sub, backgroundColor: 'transparent' }}>↑</button>
                    <button onClick={e => { e.stopPropagation(); moveSlide(slide, 'down') }} disabled={idx === sortedSlides.length - 1}
                      className="px-3 py-1.5 rounded-xl text-sm disabled:opacity-30"
                      style={{ border: `1px solid ${S.border}`, color: S.sub, backgroundColor: 'transparent' }}>↓</button>
                    <button onClick={e => { e.stopPropagation(); toggleActive(slide) }}
                      className="flex-1 py-1.5 rounded-xl text-sm font-medium"
                      style={slide.active
                        ? { border: '1px solid rgba(251,146,60,0.4)', color: '#fb923c', backgroundColor: 'transparent' }
                        : { border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80', backgroundColor: 'transparent' }}>
                      {slide.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteSlide(slide.id) }}
                      className="flex-1 py-1.5 rounded-xl text-sm font-medium"
                      style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', backgroundColor: 'transparent' }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: preview */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg" style={{ color: S.text }}>Vista previa</h2>
            <div className="rounded-2xl overflow-hidden aspect-video relative flex items-end" style={{ backgroundColor: '#000' }}>
              {previewSlide ? (
                <>
                  {previewSlide.imageUrl && (
                    <img src={previewSlide.imageUrl} alt={previewSlide.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative z-10 p-4 w-full">
                    {previewSlide.subtitle && <p className="text-sm font-medium" style={{ color: S.accent }}>{previewSlide.subtitle}</p>}
                    <p className="text-white text-xl font-bold">{previewSlide.title}</p>
                    {previewSlide.price && <p className="text-2xl font-black" style={{ color: S.accent }}>{previewSlide.price}</p>}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: S.sub }}>
                  <div className="flex flex-col items-center">
                    <span><Icon name="coffee" size={34} /></span>
                    <p className="text-sm mt-2">Selecciona un slide para previsualizar</p>
                  </div>
                </div>
              )}
            </div>
            <a href="/tv" target="_blank" rel="noopener noreferrer"
              className="block w-full text-center font-bold py-3 rounded-xl transition-colors"
              style={{ backgroundColor: S.accent, color: '#000' }}>
              Ver pantalla de TV →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
