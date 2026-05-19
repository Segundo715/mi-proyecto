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

const STATUS_MSG: Record<Order['status'], { text: string; color: string; emoji: string }> = {
  pending:   { text: 'Pedido recibido, en espera',         color: 'bg-yellow-100 border-yellow-300 text-yellow-800', emoji: '🕐' },
  preparing: { text: '¡Están preparando tu pedido!',       color: 'bg-blue-100 border-blue-300 text-blue-800',       emoji: '🍳' },
  ready:     { text: '¡Tu pedido está listo! Ve a recogerlo', color: 'bg-green-100 border-green-400 text-green-800', emoji: '✅' },
  delivered: { text: 'Pedido entregado. ¡Buen provecho!',  color: 'bg-gray-100 border-gray-300 text-gray-600',       emoji: '🎉' },
}

const MY_ORDERS_KEY = 'my_order_ids'

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [cart, setCart] = useState<CartItem[]>([])
  const [showOrder, setShowOrder] = useState(false)
  const [orderName, setOrderName] = useState('')
  const [orderTable, setOrderTable] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/menu').then(r => r.ok ? r.json() : []).then((d: MenuItem[]) => { setItems(d); setLoadingMenu(false) }).catch(() => setLoadingMenu(false))
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
        const remaining = ids.filter(id => !delivered.some(o => o.id === id && o.status === 'delivered'))
        setTimeout(() => {
          localStorage.setItem(MY_ORDERS_KEY, JSON.stringify(remaining))
        }, 30000)
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
        setTimeout(() => setOrderSuccess(false), 4000)
      }
    } finally {
      setOrderSubmitting(false)
    }
  }

  const grouped: Record<string, MenuItem[]> = {}
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-32">
      <div className="bg-amber-900 text-white sticky top-0 z-20 shadow">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="font-bold text-base">☕ Chubis — Menú</h1>
        </div>
      </div>

      {orderSuccess && (
        <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="bg-green-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg">
            ✅ ¡Pedido enviado! Lo prepararemos pronto.
          </div>
        </div>
      )}

      {myOrders.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 pt-3 space-y-2">
          {myOrders.map(order => {
            const s = STATUS_MSG[order.status]
            return (
              <div key={order.id} className={`border-2 rounded-2xl px-4 py-3 flex items-center gap-3 ${s.color}`}>
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-sm">{s.text}</p>
                  <p className="text-xs opacity-75">
                    {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')} — ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Nuestro menú</h2>
          {loadingMenu ? (
            <div className="text-center py-10 text-amber-700">Cargando menú...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-gray-400"><p className="text-4xl mb-2">🍽</p><p>El menú aún no está disponible</p></div>
          ) : (
            Object.entries(grouped).map(([category, catItems]) => (
              <div key={category} className="mb-6">
                <h3 className="font-bold text-amber-800 text-lg mb-3 border-b border-amber-200 pb-1">{category}</h3>
                <div className="space-y-3">
                  {catItems.map(item => {
                    const inCart = cart.find(c => c.item.id === item.id)
                    return (
                      <div key={item.id} className={`bg-white rounded-2xl shadow p-4 flex gap-3 ${!item.available ? 'opacity-60' : ''}`}>
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                            {!item.available && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">No disponible</span>}
                          </div>
                          {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
                          <span className="inline-block mt-1 text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">${item.price.toFixed(2)}</span>
                          {item.available && (
                            <div className="mt-2">
                              {inCart ? (
                                <div className="flex items-center gap-3">
                                  <button type="button" onClick={() => changeQty(item.id, -1)} className="w-8 h-8 bg-amber-100 text-amber-800 rounded-full font-bold text-lg flex items-center justify-center active:bg-amber-200">−</button>
                                  <span className="font-bold text-amber-900">{inCart.qty}</span>
                                  <button type="button" onClick={() => changeQty(item.id, 1)} className="w-8 h-8 bg-amber-700 text-white rounded-full font-bold text-lg flex items-center justify-center active:bg-amber-900">+</button>
                                </div>
                              ) : (
                                <button type="button" onClick={() => addToCart(item)} className="bg-amber-700 active:bg-amber-900 text-white text-sm font-bold px-4 py-1.5 rounded-xl">
                                  + Agregar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {cartCount > 0 && !showOrder && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4">
          <button type="button" onClick={() => setShowOrder(true)}
            className="w-full max-w-2xl mx-auto block bg-amber-700 active:bg-amber-900 text-white font-bold py-4 rounded-2xl shadow-xl">
            🛒 Ver pedido ({cartCount}) — ${cartTotal.toFixed(2)}
          </button>
        </div>
      )}

      {showOrder && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 pb-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-amber-900">Tu pedido</h2>
              <button type="button" onClick={() => setShowOrder(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            {cart.map(c => (
              <div key={c.item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{c.item.name}</p>
                  <p className="text-sm text-gray-500">${c.item.price.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => changeQty(c.item.id, -1)} className="w-8 h-8 bg-amber-100 text-amber-800 rounded-full font-bold text-lg flex items-center justify-center">−</button>
                  <span className="font-bold w-4 text-center">{c.qty}</span>
                  <button type="button" onClick={() => changeQty(c.item.id, 1)} className="w-8 h-8 bg-amber-700 text-white rounded-full font-bold text-lg flex items-center justify-center">+</button>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 space-y-3">
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-1">Tu nombre *</label>
                <input type="text" value={orderName} onChange={e => setOrderName(e.target.value)} placeholder="Ej. María"
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-1">Mesa (opcional)</label>
                <input type="text" value={orderTable} onChange={e => setOrderTable(e.target.value)} placeholder="Ej. 3"
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-1">Notas (opcional)</label>
                <input type="text" value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="Sin cebolla, extra salsa..."
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:border-amber-500" />
              </div>
              <button type="button" onClick={submitOrder} disabled={orderSubmitting || !orderName.trim()}
                className="w-full bg-amber-700 active:bg-amber-900 text-white font-bold py-4 rounded-2xl disabled:opacity-60">
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
