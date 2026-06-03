'use client'

import { useState } from 'react'
import Resta3Nav from '@/app/components/Resta3Nav'

const S = { bg: '#0a0d14', card: '#1a1d27', accent: '#f59e0b', text: '#f1f5f9', sub: '#64748b', border: 'rgba(245,158,11,0.1)' }

interface Product { id: number; name: string; category: string; stock: number; min: number; unit: string; cost: number }

const PRODUCTS: Product[] = [
  { id: 1, name: 'Pollo (kg)', category: 'Carnes', stock: 12, min: 5, unit: 'kg', cost: 85 },
  { id: 2, name: 'Salmón (kg)', category: 'Mariscos', stock: 3, min: 4, unit: 'kg', cost: 220 },
  { id: 3, name: 'Lechuga', category: 'Verduras', stock: 8, min: 5, unit: 'pz', cost: 12 },
  { id: 4, name: 'Tomate (kg)', category: 'Verduras', stock: 2, min: 3, unit: 'kg', cost: 25 },
  { id: 5, name: 'Arroz (kg)', category: 'Abarrotes', stock: 20, min: 10, unit: 'kg', cost: 18 },
  { id: 6, name: 'Pasta (kg)', category: 'Abarrotes', stock: 15, min: 8, unit: 'kg', cost: 22 },
  { id: 7, name: 'Coca-Cola 600ml', category: 'Bebidas', stock: 24, min: 12, unit: 'pz', cost: 14 },
  { id: 8, name: 'Agua mineral', category: 'Bebidas', stock: 30, min: 15, unit: 'pz', cost: 8 },
  { id: 9, name: 'Aceite (lt)', category: 'Abarrotes', stock: 4, min: 5, unit: 'lt', cost: 65 },
  { id: 10, name: 'Harina (kg)', category: 'Abarrotes', stock: 18, min: 10, unit: 'kg', cost: 15 },
  { id: 11, name: 'Queso Oaxaca (kg)', category: 'Lácteos', stock: 2, min: 3, unit: 'kg', cost: 120 },
  { id: 12, name: 'Crema (lt)', category: 'Lácteos', stock: 5, min: 4, unit: 'lt', cost: 45 },
]

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS)
  const [filter, setFilter] = useState<'todos' | 'bajo' | 'ok'>('todos')
  const [search, setSearch] = useState('')

  const cats = ['Todos', ...Array.from(new Set(products.map(p => p.category)))]
  const [cat, setCat] = useState('Todos')

  const displayed = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = cat === 'Todos' || p.category === cat
    const matchFilter = filter === 'todos' ? true : filter === 'bajo' ? p.stock <= p.min : p.stock > p.min
    return matchSearch && matchCat && matchFilter
  })

  const lowStock = products.filter(p => p.stock <= p.min).length
  const totalValue = products.reduce((s, p) => s + p.stock * p.cost, 0)

  function adjustStock(id: number, delta: number) {
    setProducts(ps => ps.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
  }

  return (
    <div className="min-h-screen md:ml-[220px]" style={{ backgroundColor: S.bg }}>
      <Resta3Nav />
      <div className="max-w-[1000px] mx-auto p-4 space-y-4">

        <div className="flex items-center justify-between pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>Inventario</h1>
          {lowStock > 0 && (
            <span className="text-xs font-black px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
              ⚠️ {lowStock} productos con stock bajo
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <p className="text-xl font-black" style={{ color: S.accent }}>{products.length}</p>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Productos</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: S.card, border: `1px solid rgba(239,68,68,0.2)` }}>
            <p className="text-xl font-black" style={{ color: '#f87171' }}>{lowStock}</p>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Stock bajo</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <p className="text-xl font-black" style={{ color: '#22c55e' }}>${totalValue.toLocaleString()}</p>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Valor en almacén</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..."
            className="flex-1 min-w-[160px] px-3 py-2 rounded-xl text-sm outline-none"
            style={{ backgroundColor: S.card, color: S.text, border: `1px solid ${S.border}` }} />
          {(['todos', 'bajo', 'ok'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all"
              style={filter === f ? { backgroundColor: S.accent, color: '#000' } : { backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
              {f === 'bajo' ? '⚠️ Stock bajo' : f === 'ok' ? '✅ OK' : 'Todos'}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={cat === c ? { backgroundColor: `${S.accent}22`, color: S.accent, border: `1px solid ${S.accent}44` } : { backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
              {c}
            </button>
          ))}
        </div>

        {/* Tabla */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                  {['Producto', 'Categoría', 'Stock', 'Mínimo', 'Costo unit.', 'Ajustar'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: S.sub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map(p => {
                  const low = p.stock <= p.min
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${S.border}` }} className="hover:bg-white/[.02]">
                      <td className="px-4 py-3 font-bold" style={{ color: S.text }}>{p.name}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: S.sub }}>{p.category}</td>
                      <td className="px-4 py-3">
                        <span className="font-black" style={{ color: low ? '#f87171' : '#22c55e' }}>
                          {p.stock} {p.unit}
                        </span>
                        {low && <span className="ml-2 text-xs" style={{ color: '#f87171' }}>⚠️ bajo</span>}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: S.sub }}>{p.min} {p.unit}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: S.accent }}>${p.cost}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => adjustStock(p.id, -1)} className="w-7 h-7 rounded-lg text-sm font-black flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171' }}>−</button>
                          <button onClick={() => adjustStock(p.id, 1)} className="w-7 h-7 rounded-lg text-sm font-black flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>+</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
