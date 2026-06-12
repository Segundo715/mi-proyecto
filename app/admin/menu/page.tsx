'use client'

// CRUD de platillos + personalización del menú público (/menu): logo, colores y carrusel.
// Imágenes se suben a Supabase Storage vía /api/menu/upload y /api/settings/upload.
import { useState, useEffect, useRef } from 'react'
import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)',
  text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)',
}

const CATEGORIES = ['Platillos', 'Bebidas', 'Postres', 'Ensaladas', 'Entradas', 'Especiales']

interface MenuItem {
  id: string; name: string; description: string; price: number
  category: string; imageUrl?: string; available: boolean; likes: number
}

const EMPTY = { name: '', description: '', price: '', category: 'Platillos', imageUrl: '', available: true }

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Personalización de /menu (logo, hover, fondo y botones inactivos)
  const [menuLogo, setMenuLogo] = useState('')
  const [menuHover, setMenuHover] = useState('#B90F45')
  const [menuBg, setMenuBg] = useState('#000000')
  const [menuBtn, setMenuBtn] = useState('#0d0d0d')
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [uploadingMenuLogo, setUploadingMenuLogo] = useState(false)
  const menuLogoRef = useRef<HTMLInputElement>(null)

  // Carrusel de imágenes del menú
  const [carousel, setCarousel] = useState<{ imageUrl: string; linkUrl: string }[]>([])
  const [uploadingSlide, setUploadingSlide] = useState(false)
  const [savingCarousel, setSavingCarousel] = useState(false)
  const [savedCarousel, setSavedCarousel] = useState(false)
  const carouselFileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const r = await fetch('/api/menu')
    if (r.ok) setItems(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const get = (k: string) => fetch(`/api/settings?key=${k}`).then(r => r.json()).catch(() => ({}))
    get('menu_logo').then(d => { if (d.value) setMenuLogo(d.value) })
    get('menu_hover_color').then(d => { if (d.value) setMenuHover(d.value) })
    get('menu_bg_color').then(d => { if (d.value) setMenuBg(d.value) })
    get('menu_btn_color').then(d => { if (d.value) setMenuBtn(d.value) })
    get('menu_carousel').then(d => { if (d.value) { try { setCarousel(JSON.parse(d.value)) } catch {} } })
  }, [])

  async function saveMenuSetting(key: string, value: string) {
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) })
  }

  async function saveColor(key: string, value: string) {
    setSavingKey(key)
    await saveMenuSetting(key, value)
    setSavingKey(null)
    setSavedKey(key)
    setTimeout(() => setSavedKey(null), 2000)
  }

  async function uploadMenuLogo(file: File) {
    setUploadingMenuLogo(true)
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/settings/upload', { method: 'POST', body: fd })
    const d = await r.json()
    if (d.url) {
      setMenuLogo(d.url)
      await saveMenuSetting('menu_logo', d.url)
    }
    setUploadingMenuLogo(false)
  }

  async function addSlide(file: File) {
    setUploadingSlide(true)
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/settings/upload', { method: 'POST', body: fd })
    const d = await r.json()
    if (d.url) setCarousel(prev => [...prev, { imageUrl: d.url, linkUrl: '' }])
    setUploadingSlide(false)
  }

  function updateSlideUrl(i: number, linkUrl: string) {
    setCarousel(prev => prev.map((s, idx) => idx === i ? { ...s, linkUrl } : s))
  }

  function removeSlide(i: number) {
    setCarousel(prev => prev.filter((_, idx) => idx !== i))
  }

  async function saveCarousel() {
    setSavingCarousel(true)
    await saveMenuSetting('menu_carousel', JSON.stringify(carousel))
    setSavingCarousel(false)
    setSavedCarousel(true)
    setTimeout(() => setSavedCarousel(false), 2000)
  }

  const renderColorRow = (label: string, value: string, setValue: (v: string) => void, key: string) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>{label}</label>
      <div className="flex items-center gap-2">
        <input type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'}
          onChange={e => setValue(e.target.value)}
          className="w-12 h-11 rounded-2xl cursor-pointer bg-transparent shrink-0"
          style={{ border: `1px solid ${S.border}` }} />
        <input type="text" value={value} onChange={e => setValue(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none font-mono"
          style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }} />
        <button onClick={() => saveColor(key, value)} disabled={savingKey === key}
          className="px-4 py-2 rounded-2xl text-sm font-bold shrink-0"
          style={{ backgroundColor: savedKey === key ? 'rgba(0,230,118,.2)' : `${S.accent}22`, color: savedKey === key ? '#4ade80' : S.accent }}>
          {savingKey === key ? '...' : savedKey === key ? '✓' : 'Guardar'}
        </button>
      </div>
    </div>
  )

  const ranked = [...items].filter(i => (i.likes ?? 0) > 0).sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
  const maxLikes = ranked.length > 0 ? ranked[0].likes : 1
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  function openEdit(p: MenuItem) {
    setEditing(p.id)
    setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, imageUrl: p.imageUrl ?? '', available: p.available })
    setShowForm(true)
  }

  async function uploadImage(file: File) {
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/menu/upload', { method: 'POST', body: fd })
    if (r.ok) { const d = await r.json(); setForm(p => ({ ...p, imageUrl: d.url })) }
    setUploading(false)
  }

  async function save() {
    if (!form.name.trim() || !form.price) return
    setSaving(true)
    const body = { name: form.name.trim(), description: form.description.trim(), price: Number(form.price), category: form.category, imageUrl: form.imageUrl || undefined, available: form.available }
    if (editing) {
      await fetch(`/api/menu/${editing}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setSaving(false); setShowForm(false); load()
  }

  async function toggleAvailable(p: MenuItem) {
    await fetch(`/api/menu/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ available: !p.available }) })
    load()
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar este platillo?')) return
    await fetch(`/api/menu/${id}`, { method: 'DELETE' })
    load()
  }

  const inp = 'w-full px-4 py-3 rounded-2xl text-sm outline-none'
  const inpStyle = { backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }

  return (
    <div className="min-h-screen md:ml-[240px] md:pt-16" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[1200px] mx-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-black" style={{ color: S.text }}>Menú Inteligente</h1>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Agregar, editar y controlar disponibilidad</p>
          </div>
          <button onClick={openNew} className="text-sm px-4 py-2 rounded-xl font-bold" style={{ backgroundColor: S.accent, color: '#000' }}>
            + Nuevo platillo
          </button>
        </div>

        {/* Personalización del menú público (/menu) */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
            <p className="font-bold text-sm" style={{ color: S.text }}>Personalización del menú</p>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Logo y color de los botones que se muestran en la página pública /menu</p>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Logo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Logo del menú</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shrink-0" style={{ backgroundColor: menuBg || '#000', border: `1px solid ${S.border}` }}>
                  <img src={menuLogo || '/logo.png'} alt="logo" className="w-12 h-12 object-contain" />
                </div>
                <button onClick={() => menuLogoRef.current?.click()} disabled={uploadingMenuLogo}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-bold border-dashed border-2"
                  style={{ borderColor: S.border, color: S.sub }}>
                  {uploadingMenuLogo ? 'Subiendo...' : menuLogo ? 'Cambiar logo' : 'Subir logo'}
                </button>
                <input ref={menuLogoRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadMenuLogo(f); e.target.value = '' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: S.sub }}>Se muestra arriba del menú y en el botón del carrito</p>
            </div>

            {renderColorRow('Color de los botones (hover/activo)', menuHover, setMenuHover, 'menu_hover_color')}
            {renderColorRow('Color de fondo', menuBg, setMenuBg, 'menu_bg_color')}
            {renderColorRow('Color de los botones inactivos', menuBtn, setMenuBtn, 'menu_btn_color')}

            {/* Vista previa */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: menuBg, border: `1px solid ${S.border}` }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: S.sub }}>Vista previa</p>
              <div className="space-y-1.5">
                <div className="rounded-lg px-3 py-2 text-sm font-bold text-white" style={{ backgroundColor: menuHover }}>Botón activo</div>
                <div className="rounded-lg px-3 py-2 text-sm font-bold text-white" style={{ backgroundColor: menuBtn }}>Botón inactivo</div>
              </div>
            </div>

          </div>
        </div>

        {/* Carrusel de imágenes (/menu) */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <div className="px-5 py-4 flex items-center justify-between gap-3" style={{ borderBottom: `1px solid ${S.border}` }}>
            <div>
              <p className="font-bold text-sm" style={{ color: S.text }}>Carrusel de imágenes</p>
              <p className="text-xs mt-0.5" style={{ color: S.sub }}>Imágenes 16:6 que rotan en /menu. Cada una puede dirigir a un enlace.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => carouselFileRef.current?.click()} disabled={uploadingSlide}
                className="text-sm px-4 py-2 rounded-xl font-bold"
                style={{ backgroundColor: S.card, color: S.text, border: `1px solid ${S.border}` }}>
                {uploadingSlide ? 'Subiendo...' : '+ Imagen'}
              </button>
              <button onClick={saveCarousel} disabled={savingCarousel}
                className="text-sm px-4 py-2 rounded-xl font-bold"
                style={{ backgroundColor: savedCarousel ? 'rgba(0,230,118,.2)' : S.accent, color: savedCarousel ? '#4ade80' : '#000' }}>
                {savingCarousel ? '...' : savedCarousel ? '✓ Guardado' : 'Guardar carrusel'}
              </button>
            </div>
            <input ref={carouselFileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) addSlide(f); e.target.value = '' }} />
          </div>
          <div className="p-5">
            {carousel.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: S.sub }}>Aún no hay imágenes. Usa “+ Imagen” para subir la primera.</p>
            ) : (
              <div className="space-y-3">
                {carousel.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl" style={{ backgroundColor: S.bg, border: `1px solid ${S.border}` }}>
                    <div className="w-28 rounded-xl overflow-hidden shrink-0" style={{ aspectRatio: '16 / 6', backgroundColor: '#000' }}>
                      <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>URL de destino (al tocar la imagen)</label>
                      <input type="url" value={s.linkUrl} onChange={e => updateSlideUrl(i, e.target.value)}
                        placeholder="https://… (opcional)"
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: S.card, color: S.text, border: `1px solid ${S.border}` }} />
                    </div>
                    <button onClick={() => removeSlide(i)}
                      className="px-3 py-2 rounded-xl text-xs font-bold shrink-0"
                      style={{ backgroundColor: 'rgba(239,68,68,.12)', color: '#f87171' }}>
                      Eliminar
                    </button>
                  </div>
                ))}
                <p className="text-xs" style={{ color: S.sub }}>Recuerda pulsar “Guardar carrusel” para aplicar los cambios.</p>
              </div>
            )}
          </div>
        </div>

        {/* Ranking */}
        {!loading && ranked.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Ranking — Platillos más gustados</span>
            </div>
            <div className="px-5 py-5 space-y-3">
              {ranked.slice(0, 5).map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{medals[idx]}</span>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: S.text }}>{item.name}</p>
                    <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: 'var(--ad-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${((item.likes ?? 0) / maxLikes) * 100}%`, backgroundColor: '#f472b6' }} />
                    </div>
                  </div>
                  <span className="text-sm font-black shrink-0" style={{ color: '#f472b6' }}>❤️ {item.likes}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm" style={{ color: S.sub }}>Cargando...</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                    {['Platillo', 'Categoría', 'Precio', 'Likes', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: S.sub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${S.border}` }} className="hover:bg-white/[.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl
                            ? <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                            : <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg" style={{ backgroundColor: S.bg }}>🍽️</div>
                          }
                          <div>
                            <p className="font-bold" style={{ color: S.text }}>{p.name}</p>
                            {p.description && <p className="text-xs truncate max-w-[180px]" style={{ color: S.sub }}>{p.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: S.sub }}>{p.category}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: S.text }}>${p.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span style={{ color: (p.likes ?? 0) > 0 ? '#f472b6' : S.sub }}>
                          {(p.likes ?? 0) > 0 ? `❤️ ${p.likes}` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleAvailable(p)}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold transition-all"
                          style={p.available
                            ? { backgroundColor: 'rgba(0,230,118,.12)', color: '#4ade80' }
                            : { backgroundColor: 'rgba(239,68,68,.12)', color: '#f87171' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.available ? '#4ade80' : '#f87171' }} />
                          {p.available ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)}
                            className="px-3 py-1 rounded-lg text-xs font-bold"
                            style={{ backgroundColor: `${S.accent}20`, color: S.accent }}>
                            Editar
                          </button>
                          <button onClick={() => remove(p.id)}
                            className="px-3 py-1 rounded-lg text-xs font-bold"
                            style={{ backgroundColor: 'rgba(239,68,68,.12)', color: '#f87171' }}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 space-y-4"
            style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black" style={{ color: S.text }}>{editing ? 'Editar platillo' : 'Nuevo platillo'}</h2>
              <button onClick={() => setShowForm(false)} className="text-xl" style={{ color: S.sub }}>✕</button>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: S.sub }}>Imagen</label>
              <div className="flex items-center gap-3">
                {form.imageUrl
                  ? <img src={form.imageUrl} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                  : <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: S.bg }}>🍽️</div>
                }
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-bold border-dashed border-2 transition-all"
                  style={{ borderColor: S.border, color: S.sub }}>
                  {uploading ? 'Subiendo...' : 'Subir imagen'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label htmlFor="dish-name" className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Nombre *</label>
              <input id="dish-name" name="dish_name" autoComplete="off" className={inp} style={inpStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Salmon Bowl" />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="dish-description" className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Descripción</label>
              <textarea id="dish-description" name="dish_description" className={`${inp} resize-none`} style={inpStyle} rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descripción del platillo..." />
            </div>

            {/* Precio y categoría */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dish-price" className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Precio *</label>
                <input id="dish-price" name="dish_price" type="number" className={inp} style={inpStyle} value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="150" />
              </div>
              <div>
                <label htmlFor="dish-category" className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Categoría</label>
                <select id="dish-category" name="dish_category" className={inp} style={inpStyle} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Disponible */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={form.available} onChange={e => setForm(p => ({ ...p, available: e.target.checked }))} className="sr-only" />
                <div className="w-10 h-6 rounded-full transition-all" style={{ backgroundColor: form.available ? S.accent : S.border }}>
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all" style={{ left: form.available ? '22px' : '4px' }} />
                </div>
              </div>
              <span className="text-sm font-bold" style={{ color: S.text }}>Disponible en menú</span>
            </label>

            <button onClick={save} disabled={saving || !form.name.trim() || !form.price}
              className="w-full py-4 rounded-2xl font-black text-base disabled:opacity-50"
              style={{ backgroundColor: S.accent, color: '#000' }}>
              {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear platillo'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
