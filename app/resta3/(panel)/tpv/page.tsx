'use client'

import { useState, useEffect } from 'react'
import Resta3Nav from '@/app/components/Resta3Nav'

const S = { bg: '#0a0d14', card: '#1a1d27', accent: '#f59e0b', text: '#f1f5f9', sub: '#64748b', border: 'rgba(245,158,11,0.1)' }

interface MenuItem { id: string; name: string; category: string; price: number; imageUrl?: string; available: boolean }
interface LineItem { item: MenuItem; qty: number }
interface Order { id: string; customerName: string; tableNumber?: string; status: string; total: number; notes?: string; createdAt: string; items: { name: string; quantity: number; price: number }[] }

const CATS = ['Todos', 'Platillos', 'Bebidas', 'Postres', 'Ensaladas', 'Entradas', 'Especiales']
const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo', icon: '💵' },
  { id: 'tarjeta', label: 'Tarjeta', icon: '💳' },
  { id: 'transferencia', label: 'Transferencia', icon: '📲' },
]

export default function TPVPage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<LineItem[]>([])
  const [cat, setCat] = useState('Todos')
  const [search, setSearch] = useState('')
  const [customer, setCustomer] = useState('')
  const [tableNum, setTableNum] = useState('')
  const [payment, setPayment] = useState('efectivo')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastOrder, setLastOrder] = useState<Order | null>(null)
  const [tab, setTab] = useState<'nueva' | 'historial'>('nueva')
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    fetch('/api/menu').then(r => r.json()).then(d => setMenu(Array.isArray(d) ? d.filter((m: MenuItem) => m.available) : []))
  }, [])

  useEffect(() => {
    if (tab === 'historial') loadOrders()
  }, [tab])

  async function loadOrders() {
    setLoadingOrders(true)
    const r = await fetch('/api/orders')
    if (r.ok) setOrders(await r.json())
    setLoadingOrders(false)
  }

  const filtered = menu.filter(m => {
    const matchCat = cat === 'Todos' || m.category === cat
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function addToCart(item: MenuItem) {
    setCart(c => {
      const ex = c.find(l => l.item.id === item.id)
      if (ex) return c.map(l => l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l)
      return [...c, { item, qty: 1 }]
    })
  }

  function changeQty(id: string, delta: number) {
    setCart(c => c.map(l => l.item.id === id ? { ...l, qty: Math.max(1, l.qty + delta) } : l).filter(l => l.qty > 0))
  }

  const total = cart.reduce((s, l) => s + l.item.price * l.qty, 0)
  const canOrder = customer.trim() && cart.length > 0

  async function placeOrder() {
    if (!canOrder) return
    setSaving(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: customer.trim(),
        tableNumber: tableNum.trim() || undefined,
        items: cart.map(l => ({ menuItemId: l.item.id, name: l.item.name, price: l.item.price, quantity: l.qty })),
        total,
        notes: notes.trim() ? `[${payment.toUpperCase()}] ${notes.trim()}` : `[${payment.toUpperCase()}]`,
      }),
    })
    if (res.ok) {
      const order = await res.json()
      setLastOrder(order)
      setCart([])
      setCustomer('')
      setTableNum('')
      setNotes('')
    }
    setSaving(false)
  }

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  const statusColor: Record<string, string> = { pending: '#f59e0b', preparing: '#3b82f6', ready: '#22c55e', delivered: '#64748b' }
  const statusLabel: Record<string, string> = { pending: 'Pendiente', preparing: 'En cocina', ready: 'Listo', delivered: 'Entregado' }

  return (
    <div className="min-h-screen md:ml-[220px]" style={{ backgroundColor: S.bg }}>
      <Resta3Nav />
      <div className="max-w-[1300px] mx-auto p-4">

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['nueva', 'historial'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all"
              style={tab === t ? { background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' } : { backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
              {t === 'nueva' ? '🧾 Nueva orden' : '📋 Historial'}
            </button>
          ))}
        </div>

        {tab === 'historial' ? (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            {loadingOrders ? (
              <div className="p-8 text-center text-sm" style={{ color: S.sub }}>Cargando...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: S.sub }}>Sin órdenes</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                    {['Cliente', 'Mesa', 'Total', 'Pago', 'Estado', 'Hora'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: S.sub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const payNote = o.notes?.match(/\[(\w+)\]/)?.[1] ?? '—'
                    return (
                      <tr key={o.id} style={{ borderBottom: `1px solid ${S.border}` }} className="hover:bg-white/[.02]">
                        <td className="px-4 py-3 font-bold" style={{ color: S.text }}>{o.customerName}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: S.sub }}>{o.tableNumber ?? '—'}</td>
                        <td className="px-4 py-3 font-black" style={{ color: S.accent }}>${o.total.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: S.sub }}>{payNote}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${statusColor[o.status] ?? '#64748b'}18`, color: statusColor[o.status] ?? '#64748b' }}>
                            {statusLabel[o.status] ?? o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: S.sub }}>{fmtTime(o.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Catálogo */}
            <div className="lg:col-span-2 space-y-3">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar platillo..."
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ backgroundColor: S.card, color: S.text, border: `1px solid ${S.border}` }} />
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
                      ? <img src={item.imageUrl} alt={item.name} className="w-full object-cover" style={{ height: '80px' }} />
                      : <div className="w-full flex items-center justify-center text-2xl" style={{ height: '60px', backgroundColor: '#0f1117' }}>🍽️</div>
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
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${S.border}` }}>
                <p className="font-black text-sm" style={{ color: S.text }}>Comanda</p>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-xs" style={{ color: '#f87171' }}>Limpiar</button>
                )}
              </div>

              <div className="p-4 space-y-3 flex-1">
                {/* Cliente y mesa */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Cliente *</label>
                    <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Nombre"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: '#0f1117', color: S.text, border: `1px solid ${S.border}` }} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Mesa</label>
                    <input value={tableNum} onChange={e => setTableNum(e.target.value)} placeholder="Ej: Mesa 3"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: '#0f1117', color: S.text, border: `1px solid ${S.border}` }} />
                  </div>
                </div>

                {/* Items */}
                {cart.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-2xl mb-1">🛒</p>
                    <p className="text-xs" style={{ color: S.sub }}>Toca un platillo</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                    {cart.map(line => (
                      <div key={line.item.id} className="rounded-xl p-2.5 flex items-center gap-2"
                        style={{ backgroundColor: '#0f1117' }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: S.text }}>{line.item.name}</p>
                          <p className="text-xs" style={{ color: S.accent }}>${(line.item.price * line.qty).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => changeQty(line.item.id, -1)}
                            className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center"
                            style={{ backgroundColor: S.card, color: S.sub }}>−</button>
                          <span className="text-xs font-black w-4 text-center" style={{ color: S.text }}>{line.qty}</span>
                          <button onClick={() => changeQty(line.item.id, 1)}
                            className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center"
                            style={{ backgroundColor: S.card, color: S.accent }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Método de pago */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: S.sub }}>Método de pago</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PAYMENT_METHODS.map(p => (
                      <button key={p.id} onClick={() => setPayment(p.id)}
                        className="py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all"
                        style={payment === p.id ? { backgroundColor: `${S.accent}22`, color: S.accent, border: `1px solid ${S.accent}44` } : { backgroundColor: '#0f1117', color: S.sub, border: `1px solid ${S.border}` }}>
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Notas</label>
                  <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Alergias, preferencias..."
                    className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                    style={{ backgroundColor: '#0f1117', color: S.text, border: `1px solid ${S.border}` }} />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 space-y-3" style={{ borderTop: `1px solid ${S.border}` }}>
                {lastOrder && (
                  <div className="rounded-xl px-3 py-2.5 text-xs" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <p className="font-black" style={{ color: '#22c55e' }}>✅ Orden enviada a cocina</p>
                    <p style={{ color: S.sub }}>#{lastOrder.id.slice(0, 8)} · ${lastOrder.total.toFixed(2)}</p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: S.sub }}>Total ({cart.reduce((s, l) => s + l.qty, 0)} items)</span>
                  <span className="text-2xl font-black" style={{ color: S.accent }}>${total.toFixed(2)}</span>
                </div>
                <button onClick={placeOrder} disabled={saving || !canOrder}
                  className="w-full py-3.5 rounded-xl font-black text-sm disabled:opacity-40 transition-all"
                  style={{ background: canOrder ? 'linear-gradient(135deg,#f59e0b,#d97706)' : S.card, color: canOrder ? '#000' : S.sub }}>
                  {saving ? 'Enviando...' : '🧾 Enviar a cocina'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
