'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  available: boolean
  createdAt: string
}

interface EditState {
  name: string
  description: string
  price: string
  category: string
  imageUrl: string
}

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  imageUrl: '',
  available: true,
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({
    name: '', description: '', price: '', category: '', imageUrl: '',
  })
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    try {
      const res = await fetch('/api/menu')
      if (res.ok) setItems(await res.json())
    } finally {
      setLoading(false)
    }
  }

  async function createItem() {
    if (!form.name.trim() || !form.category.trim() || !form.price) {
      setFormError('Nombre, categoría y precio son obligatorios.')
      return
    }
    setFormError('')
    setSaving(true)
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          price: parseFloat(form.price),
          category: form.category.trim(),
          imageUrl: form.imageUrl.trim() || undefined,
          available: form.available,
        }),
      })
      if (res.ok) {
        setForm(EMPTY_FORM)
        fetchItems()
      }
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id)
    setEditState({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      imageUrl: item.imageUrl ?? '',
    })
  }

  async function saveEdit(id: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editState.name.trim(),
          description: editState.description.trim(),
          price: parseFloat(editState.price),
          category: editState.category.trim(),
          imageUrl: editState.imageUrl.trim() || undefined,
        }),
      })
      if (res.ok) {
        setEditingId(null)
        fetchItems()
      }
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailable(item: MenuItem) {
    await fetch(`/api/menu/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !item.available }),
    })
    fetchItems()
  }

  async function deleteItem(id: string) {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    await fetch(`/api/menu/${id}`, { method: 'DELETE' })
    fetchItems()
  }

  // Group items by category
  const grouped: Record<string, MenuItem[]> = {}
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold text-amber-900">Gestión del Menú</h1>

        {/* Add item form */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-4">
          <h2 className="font-bold text-amber-900 text-lg">Añadir producto</h2>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-900 mb-1">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ej. Café Americano"
                className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-900 mb-1">Categoría *</label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                placeholder="Ej. Bebidas calientes"
                className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-900 mb-1">Precio *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-900 mb-1">URL de imagen (opcional)</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-900 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Descripción del producto..."
              rows={2}
              className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={form.available}
              onChange={e => setForm(p => ({ ...p, available: e.target.checked }))}
              className="w-4 h-4 accent-amber-600"
            />
            <label htmlFor="available" className="text-sm font-medium text-amber-900">Disponible</label>
          </div>

          <button
            onClick={createItem}
            disabled={saving}
            className="w-full bg-amber-700 active:bg-amber-900 text-white font-bold py-3 rounded-xl disabled:opacity-60"
          >
            {saving ? 'Guardando...' : '+ Añadir producto'}
          </button>
        </div>

        {/* Items list */}
        {loading ? (
          <div className="text-center py-10 text-amber-700">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">🍽</p>
            <p>No hay productos en el menú aún</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category} className="space-y-3">
              <h2 className="font-bold text-amber-900 text-lg border-b border-amber-200 pb-1">
                {category}
              </h2>
              {categoryItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow p-4">
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-amber-900 mb-1">Nombre</label>
                          <input
                            type="text"
                            value={editState.name}
                            onChange={e => setEditState(p => ({ ...p, name: e.target.value }))}
                            className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-amber-900 mb-1">Categoría</label>
                          <input
                            type="text"
                            value={editState.category}
                            onChange={e => setEditState(p => ({ ...p, category: e.target.value }))}
                            className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-amber-900 mb-1">Precio</label>
                          <input
                            type="number"
                            value={editState.price}
                            onChange={e => setEditState(p => ({ ...p, price: e.target.value }))}
                            min="0"
                            step="0.01"
                            className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-amber-900 mb-1">URL imagen</label>
                          <input
                            type="url"
                            value={editState.imageUrl}
                            onChange={e => setEditState(p => ({ ...p, imageUrl: e.target.value }))}
                            className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-amber-900 mb-1">Descripción</label>
                        <textarea
                          value={editState.description}
                          onChange={e => setEditState(p => ({ ...p, description: e.target.value }))}
                          rows={2}
                          className="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(item.id)}
                          disabled={saving}
                          className="flex-1 bg-amber-700 text-white font-bold py-2 rounded-xl text-sm disabled:opacity-60"
                        >
                          {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2 rounded-xl text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-xl shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                            <span className="text-sm font-bold text-green-600">
                              ${item.price.toFixed(2)}
                            </span>
                            {item.available ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Disponible</span>
                            ) : (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">No disponible</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => toggleAvailable(item)}
                          className={`flex-1 py-1.5 rounded-xl text-sm font-medium border-2 ${
                            item.available
                              ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                              : 'border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {item.available ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          className="flex-1 py-1.5 rounded-xl text-sm font-medium border-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="flex-1 py-1.5 rounded-xl text-sm font-medium border-2 border-red-200 text-red-500 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
