'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: '#080b16', card: '#0e1225', accent: '#00e676',
  text: '#eef2f7', sub: '#6b7a94', border: 'rgba(255,255,255,0.07)',
}

interface MenuItem {
  id: string; name: string; description: string; price: number
  category: string; imageUrl?: string; available: boolean; likes: number
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/menu').then(r => r.ok ? r.json() : []).then((d: MenuItem[]) => {
      setItems(d)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const ranked = [...items].filter(i => (i.likes ?? 0) > 0).sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
  const maxLikes = ranked.length > 0 ? ranked[0].likes : 1
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[1200px] mx-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-black" style={{ color: S.text }}>🍽️ Menú Inteligente</h1>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Productos, categorías y disponibilidad</p>
          </div>
          <button className="text-sm px-4 py-2 rounded-xl font-bold" style={{ backgroundColor: S.accent, color: '#000' }}>+ Nuevo producto</button>
        </div>

        {/* Ranking de más gustados */}
        {!loading && ranked.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>❤️ Ranking — Platillos más gustados</span>
            </div>
            <div className="px-5 py-5 space-y-3">
              {ranked.slice(0, 5).map((item, idx) => {
                const pct = ((item.likes ?? 0) / maxLikes) * 100
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{medals[idx]}</span>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: S.text }}>{item.name}</p>
                      <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#f472b6' }} />
                      </div>
                    </div>
                    <span className="text-sm font-black shrink-0" style={{ color: '#f472b6' }}>❤️ {item.likes}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tabla de productos */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm" style={{ color: S.sub }}>Cargando...</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                    {['Producto', 'Categoría', 'Precio', 'Me gusta', 'Estado'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: S.sub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${S.border}` }} className="hover:bg-white/[.02]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />}
                          <span className="font-bold" style={{ color: S.text }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3" style={{ color: S.sub }}>{p.category}</td>
                      <td className="px-5 py-3 font-bold" style={{ color: S.text }}>${p.price.toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <span className="font-bold" style={{ color: (p.likes ?? 0) > 0 ? '#f472b6' : S.sub }}>
                          {(p.likes ?? 0) > 0 ? `❤️ ${p.likes}` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={p.available
                            ? { backgroundColor: 'rgba(0,230,118,.12)', color: '#4ade80' }
                            : { backgroundColor: 'rgba(239,68,68,.12)', color: '#f87171' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.available ? '#4ade80' : '#f87171' }} />
                          {p.available ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
