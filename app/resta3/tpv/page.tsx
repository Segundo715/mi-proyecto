'use client'

import { useState, useEffect } from 'react'
import Resta3Nav from '@/app/components/Resta3Nav'

const S = { bg: '#0a0d14', card: '#1a1d27', accent: '#f59e0b', text: '#f1f5f9', sub: '#64748b', border: 'rgba(245,158,11,0.1)' }

interface MenuItem { id: string; name: string; category: string; price: number; imageUrl?: string; available: boolean }
interface LineItem { item: MenuItem; qty: number }

const CATS = ['Todos', 'Platillos', 'Bebidas', 'Postres', 'Ensaladas', 'Entradas', 'Especiales']

export default function TPVPage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<LineItem[]>([])
  const [cat, setCat] = useState('Todos')
  const [customer, setCustomer] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch('/api/menu').then(r => r.json()).then(d => setMenu(Array.isArray(d) ? d.filter((m: MenuItem) => m.available) : []))
  }, [])

  const filtered = menu.filter(m => cat === 'Todos' || m.category === cat)

  function addToCart(item: MenuItem) {
    setCart(c => {
      const existing = c.find(l => l.item.id === item.id)
      if (existing) return c.map(l => l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l)
      return [...c, { item, qty: 1 }]
    })
  }

  function removeFromCart(id: string) {
    setCart(c => c.filter(l => l.item.id !== id))
  }

  function changeQty(id: string, delta: number) {
    setCart(c => c.map(l => l.item.id === id ? { ...l, qty: Math.max(1, l.qty + delta) } : l))
  }

  const total = cart.reduce((s, l) => s + l.item.price * l.qty, 0)

  async function placeOrder() {
    if (!customer.trim() || cart.length === 0) return
    setSaving(true)
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: customer.trim(),
        items: cart.map(l => ({ menuItemId: l.item.id, name: l.item.name, price: l.item.price, qty: l.qty })),
        total,
      }),
    })
    setSaving(false)
    setCart([])
    setCustomer('')
    setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  return (
    <div className="min-h-screen md:ml-[220px]" style={{ backgroundColor: S.bg }}>
      <Resta3Nav />
      <div className="max-w-[1300px] mx-auto p-4">
        <h1 className="text-xl font-black mb-4" style={{ color: S.text }}>TPV — Terminal Punto de Venta</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Catálogo */}
          <div className="lg:col-span-2 space-y-3">
            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={cat === c ? { background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' } : { backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(item => (
                <button key={item.id} onClick={() => addToCart(item)}
                  className="text-left rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95"
                  style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} className="w-full object-cover" style={{ height: '90px' }} />
                    : <div className="w-full flex items-center justify-center text-3xl" style={{ height: '70px', backgroundColor: '#0f1117' }}>🍽️</div>
                  }
                  <div className="p-3">
                    <p className="text-xs font-bold truncate" style={{ color: S.text }}>{item.name}</p>
                    <p className="text-sm font-black mt-0.5" style={{ color: S.accent }}>${item.price.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Comanda */}
          <div className="rounded-2xl flex flex-col" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${S.border}` }}>
              <p className="font-black text-sm" style={{ color: S.text }}>Comanda</p>
            </div>

            <div className="p-4 flex-1 space-y-3">
              <input value={customer} onChange={e => setCustomer(e.target.value)}
                placeholder="Nombre del cliente / mesa"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ backgroundColor: '#0f1117', color: S.text, border: `1px solid ${S.border}` }} />

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-2xl mb-2">🛒</p>
                  <p className="text-xs" style={{ color: S.sub }}>Toca un platillo para agregar</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {cart.map(line => (
                    <div key={line.item.id} className="rounded-xl p-2.5 flex items-center gap-2"
                      style={{ backgroundColor: '#0f1117' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: S.text }}>{line.item.name}</p>
                        <p className="text-xs" style={{ color: S.accent }}>${(line.item.price * line.qty).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => changeQty(line.item.id, -1)} className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center" style={{ backgroundColor: S.card, color: S.sub }}>−</button>
                        <span className="text-xs font-black w-4 text-center" style={{ color: S.text }}>{line.qty}</span>
                        <button onClick={() => changeQty(line.item.id, 1)} className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center" style={{ backgroundColor: S.card, color: S.accent }}>+</button>
                        <button onClick={() => removeFromCart(line.item.id)} className="w-6 h-6 rounded-lg text-xs flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 space-y-3" style={{ borderTop: `1px solid ${S.border}` }}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold" style={{ color: S.sub }}>Total</span>
                <span className="text-xl font-black" style={{ color: S.accent }}>${total.toFixed(2)}</span>
              </div>
              {done && <p className="text-xs text-center font-bold" style={{ color: '#22c55e' }}>✅ Orden enviada a cocina</p>}
              <button onClick={placeOrder} disabled={saving || cart.length === 0 || !customer.trim()}
                className="w-full py-3 rounded-xl font-black text-sm disabled:opacity-40 transition-all"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }}>
                {saving ? 'Enviando...' : '🧾 Enviar a cocina'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
