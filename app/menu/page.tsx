'use client'

import { useState, useEffect, useRef } from 'react'
import CustomerNav from '../components/CustomerNav'

interface MenuItem {
  id: string; name: string; description: string; price: number
  category: string; imageUrl?: string; available: boolean
}

interface CartItem { item: MenuItem; qty: number }

interface Order {
  id: string; customerName: string; status: 'pending' | 'preparing' | 'ready' | 'delivered'
  items: { name: string; quantity: number; price: number }[]; total: number
}

const STATUS_MSG: Record<Order['status'], { text: string; sub: string; color: string; emoji: string }> = {
  pending:   { text: 'Pedido recibido',           sub: 'En espera de preparación',       color: 'bg-yellow-50 border-yellow-300 text-yellow-800', emoji: '🕐' },
  preparing: { text: '¡Lo están preparando!',     sub: 'Tu pedido está en cocina',        color: 'bg-blue-50 border-blue-300 text-blue-800',       emoji: '🍳' },
  ready:     { text: '¡Tu pedido está listo!',    sub: 'Pasa a recogerlo',                color: 'bg-green-50 border-green-400 text-green-800',    emoji: '✅' },
  delivered: { text: 'Pedido entregado',          sub: '¡Buen provecho!',                 color: 'bg-gray-50 border-gray-300 text-gray-600',       emoji: '🎉' },
}

const MY_ORDERS_KEY = 'my_order_ids'

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [cart, setCart] = useState<CartItem[]>([])
  const [showOrder, setShowOrder] = useState(false)
  const [orderName, setOrderName] = useState('')
  const [orderTable, setOrderTable] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/menu').then(r => r.ok ? r.json() : []).then((d: MenuItem[]) => {
      setItems(d)
      setLoadingMenu(false)
      if (d.length > 0) setActiveCategory(d[0].category)
    }).catch(() => setLoadingMenu(false))
    pollMyOrders()
    pollRef.current = setInterval(pollMyOrders, 10000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function pollMyOrders() {
    const ids: string[] = JSON.parse(localStorage.getItem(MY_ORDERS_KEY) ?? '[]')
    if (ids.length === 0) return
    try {
      const res = await fetch('/api/orders')
      if (!res.ok) return
      const all: Order[] = await res.json()
      const mine = all.filter(o => ids.includes(o.id))
      const delivered = mine.filter(o => o.status === 'delivered')
      if (delivered.length > 0) {
        const remaining = ids.filter(id => !delivered.some(o => o.id === id))
        setTimeout(() => localStorage.setItem(MY_ORDERS_KEY, JSON.stringify(remaining)), 30000)
      }
      setMyOrders(mine)
    } catch {}
  }

  function addToCart(item: MenuItem) {
    setCart(prev => {
      const i = prev.findIndex(c => c.item.id === item.id)
      if (i >= 0) return prev.map((c, idx) => idx === i ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { item, qty: 1 }]
    })
  }

  function changeQty(itemId: string, delta: number) {
    setCart(prev => prev.map(c => c.item.id === itemId ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0))
  }

  const cartTotal = cart.reduce((s, c) => s + c.item.price * c.qty, 0)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  async function submitOrder() {
    if (!orderName.trim()) return
    setOrderSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: orderName.trim(),
          tableNumber: orderTable.trim() || undefined,
          items: cart.map(c => ({ menuItemId: c.item.id, name: c.item.name, quantity: c.qty, price: c.item.price })),
          total: cartTotal,
          notes: orderNotes.trim() || undefined,
        }),
      })
      if (res.ok) {
        const order: Order = await res.json()
        const ids: string[] = JSON.parse(localStorage.getItem(MY_ORDERS_KEY) ?? '[]')
        localStorage.setItem(MY_ORDERS_KEY, JSON.stringify([...ids, order.id]))
        setMyOrders(prev => [...prev, order])
        setCart([]); setShowOrder(false); setOrderName(''); setOrderTable(''); setOrderNotes('')
        setOrderSuccess(true)
        setTimeout(() => setOrderSuccess(false), 5000)
      }
    } finally {
      setOrderSubmitting(false)
    }
  }

  function scrollToCategory(cat: string) {
    setActiveCategory(cat)
    categoryRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const grouped: Record<string, MenuItem[]> = {}
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }
  const categories = Object.keys(grouped)

  const INPUT = 'w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:border-amber-500 transition-colors'

  return (
    <div className="min-h-screen bg-stone-100 pb-32">
      {/* Header */}
      <div className="bg-amber-900 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3.5">
          <h1 className="font-black text-base tracking-tight">☕ Chubis — Menú</h1>
        </div>
      </div>

      {/* Order success toast */}
      {orderSuccess && (
        <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="bg-green-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2">
            <span>✅</span> ¡Pedido enviado! Lo prepararemos pronto.
          </div>
        </div>
      )}

      {/* My order status banners */}
      {myOrders.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 pt-3 space-y-2">
          {myOrders.map(order => {
            const s = STATUS_MSG[order.status]
            return (
              <div key={order.id} className={`border-2 rounded-2xl px-4 py-3 flex items-center gap-3 ${s.color}`}>
                <span className="text-2xl shrink-0">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{s.text}</p>
                  <p className="text-xs opacity-70">{s.sub} · {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Category scroll nav */}
      {categories.length > 1 && (
        <div className="sticky top-[52px] z-10 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 flex gap-2 overflow-x-auto py-2.5 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} type="button"
                onClick={() => scrollToCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all shrink-0 ${
                  activeCategory === cat
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4 space-y-8">
        {loadingMenu ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 flex gap-3 animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                  <div className="h-3 bg-gray-100 rounded-full w-full" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🍽</p>
            <p className="font-semibold text-lg">El menú aún no está disponible</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, catItems]) => (
            <div key={category} ref={el => { categoryRefs.current[category] = el }}>
              <h2 className="font-black text-amber-900 text-lg mb-3 flex items-center gap-2">
                <span className="flex-1">{category}</span>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{catItems.length}</span>
              </h2>
              <div className="space-y-2">
                {catItems.map(item => {
                  const inCart = cart.find(c => c.item.id === item.id)
                  return (
                    <div key={item.id}
                      className={`bg-white rounded-2xl shadow-sm flex overflow-hidden transition-all ${!item.available ? 'opacity-50' : ''}`}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name}
                          className="w-24 h-24 object-cover shrink-0" />
                      ) : (
                        <div className="w-24 h-24 bg-amber-50 shrink-0 flex items-center justify-center text-3xl">☕</div>
                      )}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start gap-1">
                            <h4 className="font-bold text-gray-900 text-sm leading-tight flex-1">{item.name}</h4>
                            {!item.available && (
                              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium shrink-0">Agotado</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-black text-amber-700 text-sm">${item.price.toFixed(2)}</span>
                          {item.available && (
                            inCart ? (
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => changeQty(item.id, -1)}
                                  className="w-7 h-7 bg-amber-100 text-amber-800 rounded-full font-black text-base flex items-center justify-center active:bg-amber-200">−</button>
                                <span className="font-black text-amber-900 text-sm w-4 text-center">{inCart.qty}</span>
                                <button type="button" onClick={() => changeQty(item.id, 1)}
                                  className="w-7 h-7 bg-amber-800 text-white rounded-full font-black text-base flex items-center justify-center active:bg-amber-950">+</button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => addToCart(item)}
                                className="bg-amber-800 active:bg-amber-950 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors">
                                + Agregar
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart bar */}
      {cartCount > 0 && !showOrder && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-1">
          <button type="button" onClick={() => setShowOrder(true)}
            className="w-full max-w-2xl mx-auto flex items-center justify-between bg-amber-800 active:bg-amber-950 text-white font-bold py-4 px-5 rounded-2xl shadow-2xl">
            <span className="flex items-center gap-2">
              <span className="bg-white text-amber-800 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center">{cartCount}</span>
              Ver pedido
            </span>
            <span className="font-black">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Order modal */}
      {showOrder && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end backdrop-blur-sm">
          <div className="w-full bg-white rounded-t-3xl p-6 pb-10 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900">Tu pedido</h2>
              <button type="button" onClick={() => setShowOrder(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">×</button>
            </div>

            <div className="space-y-2">
              {cart.map(c => (
                <div key={c.item.id} className="flex items-center gap-3 py-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{c.item.name}</p>
                    <p className="text-xs text-gray-400">${c.item.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => changeQty(c.item.id, -1)}
                      className="w-8 h-8 bg-gray-100 text-gray-700 rounded-full font-bold text-lg flex items-center justify-center active:bg-gray-200">−</button>
                    <span className="font-black text-gray-900 w-4 text-center text-sm">{c.qty}</span>
                    <button type="button" onClick={() => changeQty(c.item.id, 1)}
                      className="w-8 h-8 bg-amber-800 text-white rounded-full font-bold text-lg flex items-center justify-center active:bg-amber-950">+</button>
                  </div>
                  <span className="text-sm font-black text-gray-800 w-14 text-right shrink-0">${(c.item.price * c.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl px-4 py-3 flex justify-between font-black text-gray-900 text-lg">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Tu nombre *</label>
                <input type="text" value={orderName} onChange={e => setOrderName(e.target.value)}
                  placeholder="Ej. María" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Mesa (opcional)</label>
                <input type="text" value={orderTable} onChange={e => setOrderTable(e.target.value)}
                  placeholder="Ej. 3" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Notas (opcional)</label>
                <input type="text" value={orderNotes} onChange={e => setOrderNotes(e.target.value)}
                  placeholder="Sin cebolla, extra salsa..." className={INPUT} />
              </div>
              <button type="button" onClick={submitOrder} disabled={orderSubmitting || !orderName.trim()}
                className="w-full bg-amber-800 active:bg-amber-950 text-white font-black py-4 rounded-2xl text-base disabled:opacity-60 transition-colors">
                {orderSubmitting ? 'Enviando...' : '✅ Confirmar pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomerNav active="menu" />
    </div>
  )
}
