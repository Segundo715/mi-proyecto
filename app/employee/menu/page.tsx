'use client'

import { useState, useEffect } from 'react'
import EmployeeNav from '@/app/components/EmployeeNav'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  available: boolean
}

const S = {
  bg:     '#080b16',
  card:   '#0e1225',
  accent: '#00e676',
  text:   '#eef2f7',
  sub:    '#6b7a94',
  border: 'rgba(255,255,255,0.07)',
}

export default function EmployeeMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.ok ? r.json() : [])
      .then((data: MenuItem[]) => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const grouped: Record<string, MenuItem[]> = {}
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  const filteredItems = search.trim()
    ? items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
      )
    : null

  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <EmployeeNav />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>Menú</h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(0,230,118,0.1)', color: S.accent }}>
            Solo lectura
          </span>
        </div>

        {/* Search */}
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
          style={{ backgroundColor: S.card, color: S.text, border: `1px solid ${S.border}` }} />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ backgroundColor: S.card }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: S.sub }}>
            <p className="text-5xl mb-3">🍽</p>
            <p className="font-semibold" style={{ color: S.text }}>No hay productos en el menú</p>
          </div>
        ) : filteredItems ? (
          /* Search results — flat list */
          <div className="space-y-2">
            {filteredItems.length === 0 ? (
              <p className="text-center py-8" style={{ color: S.sub }}>Sin resultados</p>
            ) : filteredItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm" style={{ color: S.text }}>{item.name}</p>
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={item.available
                        ? { backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                        : { backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                      {item.available ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: S.sub }}>{item.category}</p>
                  {item.description && <p className="text-xs truncate" style={{ color: S.sub }}>{item.description}</p>}
                </div>
                <span className="font-black text-sm shrink-0" style={{ color: S.accent }}>${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          /* Accordion by category */
          <div className="space-y-2">
            {Object.entries(grouped).map(([category, categoryItems]) => {
              const isOpen = openCategory === category
              const available = categoryItems.filter(i => i.available).length
              return (
                <div key={category} className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                  <button type="button" onClick={() => setOpenCategory(isOpen ? null : category)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                    style={{ borderBottom: isOpen ? `1px solid ${S.border}` : 'none' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isOpen ? S.accent : '#6b7a94' }} />
                      <span className="font-bold text-sm" style={{ color: isOpen ? S.accent : S.text }}>{category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: S.sub }}>
                        {available}/{categoryItems.length}
                      </span>
                      <span className="text-xs transition-transform" style={{
                        color: S.sub,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        display: 'inline-block',
                      }}>▾</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="divide-y" style={{ borderColor: S.border }}>
                      {categoryItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-3"
                          style={{ opacity: item.available ? 1 : 0.5 }}>
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name}
                              className="w-12 h-12 object-cover rounded-xl shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm" style={{ color: S.text }}>{item.name}</p>
                            {item.description && (
                              <p className="text-xs truncate" style={{ color: S.sub }}>{item.description}</p>
                            )}
                            {!item.available && (
                              <span className="text-[10px] font-bold" style={{ color: '#f87171' }}>No disponible</span>
                            )}
                          </div>
                          <span className="font-black text-sm shrink-0" style={{ color: S.accent }}>
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
