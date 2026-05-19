'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

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

export default function AdminTVPage() {
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
    if (!form.title.trim()) {
      setFormError('El título es obligatorio.')
      return
    }
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
      if (res.ok) {
        setForm(EMPTY_FORM)
        fetchSlides()
      }
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
      fetch(`/api/tv/${slide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: other.order }),
      }),
      fetch(`/api/tv/${other.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: slide.order }),
      }),
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
      if (res.ok) {
        const { url } = await res.json()
        setForm(p => ({ ...p, imageUrl: url }))
      }
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
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold text-amber-900">Pantalla de TV</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: list + form */}
          <div className="space-y-4">
            {/* Add slide form */}
            <div className="bg-white rounded-2xl shadow p-5 space-y-3">
              <h2 className="font-bold text-amber-900 text-lg">Añadir slide</h2>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ej. Café del día"
                  className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1">Subtítulo (opcional)</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Ej. Recién tostado"
                  className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1">Precio (opcional)</label>
                <input
                  type="text"
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  placeholder="Ej. $50"
                  className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1">Imagen (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-800"
                />
                {uploading && <p className="text-xs text-amber-600 mt-1">Subiendo imagen...</p>}
                {form.imageUrl && (
                  <div className="mt-2 relative inline-block">
                    <img src={form.imageUrl} alt="preview" className="h-20 rounded-xl object-cover" />
                    <button type="button" onClick={() => setForm(p => ({ ...p, imageUrl: '' }))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center leading-none">×</button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="slideOffer"
                  checked={form.isOffer}
                  onChange={e => setForm(p => ({ ...p, isOffer: e.target.checked }))}
                  className="w-4 h-4 accent-amber-600"
                />
                <label htmlFor="slideOffer" className="text-sm font-medium text-amber-900">Es oferta / promoción (2x1, descuento…)</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="slideActive"
                  checked={form.active}
                  onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4 accent-amber-600"
                />
                <label htmlFor="slideActive" className="text-sm font-medium text-amber-900">Activo</label>
              </div>

              <button
                onClick={createSlide}
                disabled={saving}
                className="w-full bg-amber-700 active:bg-amber-900 text-white font-bold py-3 rounded-xl disabled:opacity-60"
              >
                {saving ? 'Guardando...' : '+ Añadir slide'}
              </button>
            </div>

            {/* Slides list */}
            {loading ? (
              <div className="text-center py-10 text-amber-700">Cargando...</div>
            ) : sortedSlides.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">📺</p>
                <p>No hay slides aún</p>
              </div>
            ) : (
              sortedSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`bg-white rounded-2xl shadow p-4 cursor-pointer border-2 transition-colors ${
                    previewSlide?.id === slide.id ? 'border-amber-400' : 'border-transparent'
                  }`}
                  onClick={() => setPreviewSlide(slide)}
                >
                  <div className="flex items-start gap-3">
                    {slide.imageUrl && (
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-14 h-14 object-cover rounded-xl shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                          #{idx + 1}
                        </span>
                        <p className="font-bold text-gray-900 truncate">{slide.title}</p>
                      </div>
                      {slide.subtitle && (
                        <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
                      )}
                      {slide.price && (
                        <p className="text-sm font-bold text-green-600">{slide.price}</p>
                      )}
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          slide.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {slide.active ? 'Activo' : 'Inactivo'}
                        </span>
                        {slide.isOffer && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700">
                            🏷 Oferta · 30s
                          </span>
                        )}
                        {!slide.isOffer && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">
                            🖼 Imagen · 15s
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={e => { e.stopPropagation(); moveSlide(slide, 'up') }}
                      disabled={idx === 0}
                      className="px-3 py-1.5 rounded-xl text-sm border-2 border-gray-200 text-gray-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); moveSlide(slide, 'down') }}
                      disabled={idx === sortedSlides.length - 1}
                      className="px-3 py-1.5 rounded-xl text-sm border-2 border-gray-200 text-gray-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); toggleActive(slide) }}
                      className={`flex-1 py-1.5 rounded-xl text-sm font-medium border-2 ${
                        slide.active
                          ? 'border-orange-200 text-orange-600'
                          : 'border-green-200 text-green-600'
                      }`}
                    >
                      {slide.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteSlide(slide.id) }}
                      className="flex-1 py-1.5 rounded-xl text-sm font-medium border-2 border-red-200 text-red-500"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: preview */}
          <div className="space-y-4">
            <h2 className="font-bold text-amber-900 text-lg">Vista previa</h2>
            <div className="bg-gray-900 rounded-2xl overflow-hidden aspect-video relative flex items-end">
              {previewSlide ? (
                <>
                  {previewSlide.imageUrl && (
                    <img
                      src={previewSlide.imageUrl}
                      alt={previewSlide.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative z-10 p-4 w-full">
                    {previewSlide.subtitle && (
                      <p className="text-amber-400 text-sm font-medium">{previewSlide.subtitle}</p>
                    )}
                    <p className="text-white text-xl font-bold">{previewSlide.title}</p>
                    {previewSlide.price && (
                      <p className="text-green-400 text-2xl font-black">{previewSlide.price}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-4xl">☕</p>
                    <p className="text-sm mt-2">Selecciona un slide para previsualizar</p>
                  </div>
                </div>
              )}
            </div>
            <a
              href="/tv"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-amber-700 text-white font-bold py-3 rounded-xl hover:bg-amber-800 transition-colors"
            >
              Ver pantalla de TV →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
