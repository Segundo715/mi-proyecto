'use client'

import { useState, useEffect, useRef } from 'react'
import CustomerNav from '../components/CustomerNav'
import { FEATURES } from '@/lib/features'

const FAVORITES_KEY = 'favorites'

interface MenuItem {
  id: string; name: string; description: string; price: number
  category: string; imageUrl?: string; available: boolean
}

interface CartItem { item: MenuItem; qty: number }

interface Order {
  id: string; customerName: string; status: 'pending' | 'preparing' | 'ready' | 'delivered'
  items: { name: string; quantity: number; price: number }[]; total: number
}

const STATUS_MSG: Record<Order['status'], { text: string; sub: string; emoji: string }> = {
  pending:   { text: 'Pedido recibido',        sub: 'En espera de preparación', emoji: '🕐' },
  preparing: { text: '¡Lo están preparando!',  sub: 'Tu pedido está en cocina', emoji: '🍳' },
  ready:     { text: '¡Tu pedido está listo!', sub: 'Pasa a recogerlo',         emoji: '✅' },
  delivered: { text: 'Pedido entregado',        sub: '¡Buen provecho!',         emoji: '🎉' },
}

const MY_ORDERS_KEY = 'my_order_ids'

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [favorites, setFavorites] = useState<string[]>([])
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [openItem, setOpenItem] = useState<string | null>(null)

  const [cart, setCart] = useState<CartItem[]>([])
  const [showOrder, setShowOrder] = useState(false)
  const [orderName, setOrderName] = useState('')
  const [orderTable, setOrderTable] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  useEffect(() => {
    if (FEATURES.favorites.enabled) {
      setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]'))
    }
    fetch('/api/menu').then(r => r.ok ? r.json() : []).then((d: MenuItem[]) => {
      setItems(d)
      setLoadingMenu(false)
      if (d.length > 0) setOpenCategory(d[0].category)
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

  function toggleFavorite(id: string) {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
      return next
    })
  }

  function toggleCategory(cat: string) {
    setOpenCategory(prev => prev === cat ? null : cat)
    setOpenItem(null)
  }

  function toggleItem(id: string) {
    setOpenItem(prev => prev === id ? null : id)
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

  const grouped: Record<string, MenuItem[]> = {}
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }
  const categories = Object.keys(grouped)

  const INPUT = 'w-full border border-[#B90F45]/40 rounded-2xl px-4 py-3 text-white bg-[#1a1a1a] placeholder-gray-500 focus:outline-none focus:border-[#B90F45] transition-colors'

  function ItemDetail({ item }: { item: MenuItem }) {
    const inCart = cart.find(c => c.item.id === item.id)
    return (
      <div className="text-center" style={{ backgroundColor: '#0d0d0d', padding: '15px 0' }}>
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name}
            className="mx-auto block rounded-lg object-cover"
            style={{ maxWidth: '300px', height: '200px', width: '90%' }} />
        )}
        <div className="flex justify-center items-center gap-4 mt-3 mb-2">
          <span className="text-gray-400 text-sm">C/U</span>
          <span className="text-white font-bold text-xl">${item.price.toFixed(2)}</span>
          {FEATURES.favorites.enabled && (
            <button type="button" onClick={() => toggleFavorite(item.id)}
              className="text-lg transition-transform active:scale-125"
              style={{ color: favorites.includes(item.id) ? '#B90F45' : '#555' }}>
              {favorites.includes(item.id) ? '❤️' : '🤍'}
            </button>
          )}
        </div>
        {inCart ? (
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-gray-300 text-sm">Cantidad:</span>
            <button type="button" onClick={() => changeQty(item.id, -1)}
              className="text-white font-black text-lg w-8 h-8 rounded flex items-center justify-center"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #B90F45' }}>−</button>
            <span className="text-white font-bold w-6 text-center">{inCart.qty}</span>
            <button type="button" onClick={() => changeQty(item.id, 1)}
              className="text-white font-black text-lg w-8 h-8 rounded flex items-center justify-center"
              style={{ backgroundColor: '#B90F45' }}>+</button>
          </div>
        ) : (
          <button type="button" onClick={() => addToCart(item)}
            className="text-white font-bold mt-3 py-2.5 transition-colors"
            style={{ backgroundColor: '#B90F45', width: '90%', maxWidth: '300px', display: 'block', margin: '12px auto 0' }}>
            Agregar al Pedido
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#000000' }}>

      {/* Toast pedido enviado */}
      {orderSuccess && (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2"
            style={{ backgroundColor: '#B90F45' }}>
            ✅ ¡Pedido enviado! Lo prepararemos pronto.
          </div>
        </div>
      )}

      {/* Banners de estado de pedidos */}
      {myOrders.length > 0 && (
        <div className="px-4 pt-3 space-y-2" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {myOrders.map(order => {
            const s = STATUS_MSG[order.status]
            return (
              <div key={order.id} className="border rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#B90F45' }}>
                <span className="text-2xl shrink-0">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white">{s.text}</p>
                  <p className="text-xs text-gray-400">{s.sub} · {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Logo + Cerrar sesión */}
      <div className="py-5 flex items-center justify-center relative" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <img src="/logo.png" alt="Logo" className="mx-auto block" style={{ maxWidth: '90px' }} />
        <button
          type="button"
          onClick={() => { localStorage.removeItem('loyalty_id'); localStorage.removeItem('loyalty_pending_id'); window.location.href = '/loyalty' }}
          className="absolute right-4 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: '#1a1a1a', color: '#B90F45', border: '1px solid #B90F45' }}>
          Cerrar sesión
        </button>
      </div>

      {/* Menú acordeón */}
      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        {loadingMenu ? (
          <div className="space-y-px">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-11 animate-pulse" style={{ backgroundColor: '#0d0d0d' }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-3">🍽</p>
            <p className="font-semibold text-lg text-white">El menú aún no está disponible</p>
          </div>
        ) : (
          <>
            {/* Favoritos */}
            {FEATURES.favorites.enabled && (() => {
              const favItems = items.filter(i => favorites.includes(i.id))
              if (!favItems.length) return null
              const catKey = '__favoritos__'
              const isOpen = openCategory === catKey
              return (
                <div key={catKey}>
                  <button type="button" onClick={() => toggleCategory(catKey)}
                    className="w-full flex items-center justify-between px-3 py-3 text-white font-bold text-base"
                    style={{ backgroundColor: isOpen ? '#B90F45' : '#000000', borderTop: '1px solid #1a1a1a' }}>
                    <span>❤️ Mis favoritos</span>
                    <span style={{ fontSize: '18px' }}>{isOpen ? '∧' : '∨'}</span>
                  </button>
                  {isOpen && (
                    <div style={{ backgroundColor: '#0d0d0d' }}>
                      {favItems.map(item => {
                        const isItemOpen = openItem === item.id
                        return (
                          <div key={item.id}>
                            <button type="button" onClick={() => toggleItem(item.id)}
                              className="w-full flex items-center justify-center relative py-3 text-white"
                              style={{ backgroundColor: isItemOpen ? '#B90F45' : '#0d0d0d', borderTop: '1px solid #1a1a1a' }}>
                              <span style={{ width: '200px', textAlign: 'left' }}>{item.name}</span>
                              <span className="absolute right-4" style={{ fontSize: '18px' }}>{isItemOpen ? '∧' : '∨'}</span>
                            </button>
                            {isItemOpen && <ItemDetail item={item} />}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Categorías */}
            {categories.map(category => {
              const catItems = grouped[category]
              const isOpen = openCategory === category
              return (
                <div key={category}>
                  <button type="button" onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-3 py-3 text-white font-bold text-base"
                    style={{ backgroundColor: isOpen ? '#B90F45' : '#000000', borderTop: '1px solid #1a1a1a' }}>
                    <span>{category}</span>
                    <span style={{ fontSize: '18px' }}>{isOpen ? '∧' : '∨'}</span>
                  </button>
                  {isOpen && (
                    <div style={{ backgroundColor: '#0d0d0d' }}>
                      {catItems.map(item => {
                        const isItemOpen = openItem === item.id
                        return (
                          <div key={item.id} style={{ opacity: item.available ? 1 : 0.5 }}>
                            <button type="button"
                              onClick={() => item.available && toggleItem(item.id)}
                              className="w-full flex items-center justify-center relative py-3 text-white"
                              style={{
                                backgroundColor: isItemOpen ? '#B90F45' : '#0d0d0d',
                                borderTop: '1px solid #1a1a1a',
                                cursor: item.available ? 'pointer' : 'not-allowed',
                              }}>
                              <span style={{ width: '200px', textAlign: 'left' }}>
                                {item.name}
                                {!item.available && <span className="ml-1 text-xs text-red-400">(Agotado)</span>}
                              </span>
                              <span className="absolute right-4" style={{ fontSize: '18px' }}>{isItemOpen ? '∧' : '∨'}</span>
                            </button>
                            {isItemOpen && <ItemDetail item={item} />}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            <div style={{ borderBottom: '1px solid #1a1a1a' }} />
          </>
        )}
      </div>

      {/* Botón flotante del carrito */}
      <div className="fixed z-40" style={{ bottom: '72px', right: '20px' }}>
        <button type="button" onClick={() => cartCount > 0 && setShowOrder(true)}
          className="relative flex items-center justify-center rounded-full shadow-2xl transition-transform active:scale-95"
          style={{ width: '60px', height: '60px', backgroundColor: '#DC5E86', opacity: cartCount > 0 ? 1 : 0.45 }}>
          <img src="/logo.png" alt="" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          {cartCount > 0 && (
            <span className="absolute flex items-center justify-center text-white font-black rounded-full"
              style={{ top: '-4px', right: '-4px', width: '22px', height: '22px', backgroundColor: '#B02350', fontSize: '11px' }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Modal del pedido */}
      {showOrder && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-end backdrop-blur-sm">
          <div className="w-full rounded-t-3xl p-6 pb-10 space-y-4 max-h-[92vh] overflow-y-auto"
            style={{ backgroundColor: '#0d0d0d' }}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-white">Tu pedido</h2>
              <button type="button" onClick={() => setShowOrder(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: '#1a1a1a' }}>×</button>
            </div>
            <div className="space-y-2">
              {cart.map(c => (
                <div key={c.item.id} className="flex items-center gap-3 py-2"
                  style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{c.item.name}</p>
                    <p className="text-xs text-gray-400">${c.item.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => changeQty(c.item.id, -1)}
                      className="w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: '#1a1a1a', border: '1px solid #B90F45' }}>−</button>
                    <span className="font-black text-white w-4 text-center text-sm">{c.qty}</span>
                    <button type="button" onClick={() => changeQty(c.item.id, 1)}
                      className="w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: '#B90F45' }}>+</button>
                  </div>
                  <span className="text-sm font-black text-white w-14 text-right shrink-0">
                    ${(c.item.price * c.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl px-4 py-3 flex justify-between font-black text-white text-lg"
              style={{ backgroundColor: '#1a1a1a' }}>
              <span>Total</span><span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Tu nombre *</label>
                <input type="text" value={orderName} onChange={e => setOrderName(e.target.value)}
                  placeholder="Ej. María" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Mesa (opcional)</label>
                <input type="text" value={orderTable} onChange={e => setOrderTable(e.target.value)}
                  placeholder="Ej. 3" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Notas (opcional)</label>
                <input type="text" value={orderNotes} onChange={e => setOrderNotes(e.target.value)}
                  placeholder="Sin cebolla, extra salsa..." className={INPUT} />
              </div>
              <button type="button" onClick={submitOrder} disabled={orderSubmitting || !orderName.trim()}
                className="w-full text-white font-black py-4 rounded-2xl text-base disabled:opacity-60 transition-colors"
                style={{ backgroundColor: '#B90F45' }}>
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
