'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: '#080b16', card: '#0e1225', accent: '#00e676',
  text: '#eef2f7', sub: '#6b7a94', border: 'rgba(255,255,255,0.07)',
}

interface Recipe {
  id: string
  name: string
  description: string
  category: string
  ingredients: string[]
  steps: string[]
  imageUrl?: string
  createdAt: string
}

const EMPTY = { name: '', description: '', category: 'General', ingredients: [''], steps: [''], imageUrl: '' }

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Recipe | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const r = await fetch('/api/recipes')
    setRecipes(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  function openEdit(r: Recipe) {
    setEditing(r.id)
    setForm({ name: r.name, description: r.description, category: r.category, ingredients: r.ingredients, steps: r.steps, imageUrl: r.imageUrl ?? '' })
    setShowForm(true)
    setSelected(null)
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    const body = { ...form, ingredients: form.ingredients.filter(Boolean), steps: form.steps.filter(Boolean), imageUrl: form.imageUrl || undefined }
    if (editing) {
      await fetch(`/api/recipes/${editing}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setSaving(false)
    setShowForm(false)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Eliminar esta receta?')) return
    await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
    setSelected(null)
    load()
  }

  function listField(arr: string[], onChange: (v: string[]) => void) {
    return (
      <div className="space-y-1">
        {arr.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input value={v} onChange={e => { const n = [...arr]; n[i] = e.target.value; onChange(n) }}
              className="flex-1 px-3 py-2 rounded-xl text-sm"
              style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}`, outline: 'none' }} />
            <button onClick={() => onChange(arr.filter((_, j) => j !== i))} className="text-red-400 px-2">x</button>
          </div>
        ))}
        <button onClick={() => onChange([...arr, ''])}
          className="text-xs font-bold px-3 py-1 rounded-lg" style={{ backgroundColor: `${S.accent}22`, color: S.accent }}>
          + Agregar
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[1000px] mx-auto p-4 space-y-4">

        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-black" style={{ color: S.text }}>Recetario</h1>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Recetas del restaurante con ingredientes y pasos</p>
          </div>
          <button onClick={openNew} className="text-sm px-4 py-2 rounded-xl font-bold" style={{ backgroundColor: S.accent, color: '#000' }}>
            + Nueva receta
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm" style={{ color: S.sub }}>Cargando...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recipes.map(r => (
              <button key={r.id} onClick={() => setSelected(r)} className="text-left rounded-2xl overflow-hidden transition-all"
                style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-full object-cover" style={{ height: '140px' }} />}
                <div className="p-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${S.accent}22`, color: S.accent }}>{r.category}</span>
                  <p className="font-black text-sm mt-2" style={{ color: S.text }}>{r.name}</p>
                  <p className="text-xs mt-1" style={{ color: S.sub }}>{r.ingredients.length} ingredientes · {r.steps.length} pasos</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal ver receta */}
      {selected && !showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }} onClick={() => setSelected(null)}>
          <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
            style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }} onClick={e => e.stopPropagation()}>
            {selected.imageUrl && <img src={selected.imageUrl} alt={selected.name} className="w-full object-cover rounded-t-3xl" style={{ height: '200px' }} />}
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${S.accent}22`, color: S.accent }}>{selected.category}</span>
                  <h2 className="text-xl font-black mt-1" style={{ color: S.text }}>{selected.name}</h2>
                  {selected.description && <p className="text-sm mt-1" style={{ color: S.sub }}>{selected.description}</p>}
                </div>
                <button onClick={() => setSelected(null)} style={{ color: S.sub }} className="text-xl">x</button>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: S.accent }}>Ingredientes</p>
                <ul className="space-y-1">
                  {selected.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: S.text }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: S.accent }} />{ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: S.accent }}>Preparacion</p>
                <ol className="space-y-2">
                  {selected.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm" style={{ color: S.text }}>
                      <span className="font-black shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{ backgroundColor: S.accent, color: '#000' }}>{i + 1}</span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => openEdit(selected)} className="flex-1 py-3 rounded-2xl text-sm font-bold"
                  style={{ backgroundColor: `${S.accent}22`, color: S.accent }}>Editar</button>
                <button onClick={() => remove(selected.id)} className="flex-1 py-3 rounded-2xl text-sm font-bold"
                  style={{ backgroundColor: 'rgba(239,68,68,.12)', color: '#f87171' }}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 space-y-4"
            style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black" style={{ color: S.text }}>{editing ? 'Editar receta' : 'Nueva receta'}</h2>
              <button onClick={() => setShowForm(false)} style={{ color: S.sub }} className="text-xl">x</button>
            </div>
            {(['name', 'category', 'imageUrl'] as const).map(key => (
              <div key={key}>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>
                  {key === 'name' ? 'Nombre' : key === 'category' ? 'Categoria' : 'URL imagen'}
                </label>
                <input type="text" value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl text-sm"
                  style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}`, outline: 'none' }} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Descripcion</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                className="w-full px-4 py-3 rounded-2xl text-sm resize-none"
                style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}`, outline: 'none' }} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: S.sub }}>Ingredientes</label>
              {listField(form.ingredients, v => setForm(p => ({ ...p, ingredients: v })))}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: S.sub }}>Pasos de preparacion</label>
              {listField(form.steps, v => setForm(p => ({ ...p, steps: v })))}
            </div>
            <button onClick={save} disabled={saving || !form.name.trim()}
              className="w-full py-4 rounded-2xl font-black text-base disabled:opacity-50"
              style={{ backgroundColor: S.accent, color: '#000' }}>
              {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear receta'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
