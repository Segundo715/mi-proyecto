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

const STATUS_MSG: Record<Order['status'], { text: string; sub: string; color: string; emoji: string }> = {
  pending:   { text: 'Pedido recibido',           sub: 'En espera de preparación',       color: 'bg-yellow-900/40 border-yellow-600 text-yellow-300', emoji: '🕐' },
  preparing: { text: '¡Lo están preparando!',     sub: 'Tu pedido está en cocina',        color: 'bg-blue-900/40 border-blue-600 text-blue-300',       emoji: '🍳' },
  ready:     { text: '¡Tu pedido está listo!',    sub: 'Pasa a recogerlo',                color: 'bg-green-900/40 border-green-600 text-green-300',    emoji: '✅' },
  delivered: { text: 'Pedido entregado',          sub: '¡Buen provecho!',                 color: 'bg-gray-800 border-gray-600 text-gray-400',          emoji: '🎉' },
}

const MY_ORDERS_KEY = 'my_order_ids'

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    if (FEATURES.favorites.enabled) {
      setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]'))
    }
  }, [])

  function toggleFavorite(id: string) {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
      return next
    })
  }

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

  const INPUT = 'w-full border border-[#B90F45]/40 rounded-2xl px-4 py-3 text-white bg-[#1a1a1a] placeholder-gray-500 focus:outline-none focus:border-[#B90F45] transition-colors'

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: '#000000' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 shadow-lg" style={{ backgroundColor: '#000000', borderBottom: '1px solid #B90F45' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-9 w-auto" />
          <h1 className="font-black text-base tracking-tight text-white">Menú</h1>
        </div>
      </div>

      {/* Order success toast */}
      {orderSuccess && (
        <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2" style={{ backgroundColor: '#B90F45' }}>
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
              <div key={order.id} className={`border rounded-2xl px-4 py-3 flex items-center gap-3 ${s.color}`}>
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
        <div className="sticky top-[52px] z-10 backdrop-blur" style={{ backgroundColor: '#0d0d0d', borderBottom: '1px solid #1a1a1a' }}>
          <div className="max-w-2xl mx-auto px-4 flex gap-2 overflow-x-auto py-2.5 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} type="button"
                onClick={() => scrollToCategory(cat)}
                className="whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all shrink-0 text-white"
                style={{
                  backgroundColor: activeCategory === cat ? '#B90F45' : '#1a1a1a',
                }}>
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
              <div key={i} className="rounded-2xl p-4 flex gap-3 animate-pulse" style={{ backgroundColor: '#0d0d0d' }}>
                <div className="w-20 h-20 rounded-2xl shrink-0" style={{ backgroundColor: '#1a1a1a' }} />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 rounded-full w-2/3" style={{ backgroundColor: '#1a1a1a' }} />
                  <div className="h-3 rounded-full w-full" style={{ backgroundColor: '#1a1a1a' }} />
                  <div className="h-3 rounded-full w-1/3" style={{ backgroundColor: '#1a1a1a' }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-3">🍽</p>
            <p className="font-semibold text-lg">El menú aún no está disponible</p>
          </div>
        ) : (
          <>
          {FEATURES.favorites.enabled && favorites.length > 0 && (() => {
            const favItems = items.filter(i => favorites.includes(i.id))
            return (
              <div>
                <h2 className="font-black text-lg mb-3 flex items-center gap-2" style={{ color: '#B90F45' }}>
                  <span>❤️ Mis favoritos</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#B90F45' }}>{favItems.length}</span>
                </h2>
                <div className="space-y-2">
                  {favItems.map(item => {
                    const inCart = cart.find(c => c.item.id === item.id)
                    return (
                      <div key={item.id}
                        className={`rounded-2xl flex overflow-hidden transition-all ${!item.available ? 'opacity-50' : ''}`}
                        style={{ backgroundColor: '#0d0d0d' }}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover shrink-0" />
                        ) : (
                          <div className="w-24 h-24 shrink-0 flex items-center justify-center text-3xl" style={{ backgroundColor: '#1a1a1a' }}>🍽</div>
                        )}
                        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start gap-1">
                              <h4 className="font-bold text-white text-sm leading-tight flex-1">{item.name}</h4>
                              <button type="button" onClick={() => toggleFavorite(item.id)}
                                className="shrink-0 text-base leading-none active:scale-125 transition-transform" style={{ color: '#B90F45' }}>❤️</button>
                            </div>
                            {item.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-black text-sm" style={{ color: '#B90F45' }}>${item.price.toFixed(2)}</span>
                            {item.available && (
                              inCart ? (
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={() => changeQty(item.id, -1)}
                                    className="w-7 h-7 rounded-full font-black text-base flex items-center justify-center text-white"
                                    style={{ backgroundColor: '#1a1a1a', border: '1px solid #B90F45' }}>−</button>
                                  <span className="font-black text-white text-sm w-4 text-center">{inCart.qty}</span>
                                  <button type="button" onClick={() => changeQty(item.id, 1)}
                                    className="w-7 h-7 rounded-full font-black text-base flex items-center justify-center text-white"
                                    style={{ backgroundColor: '#B90F45' }}>+</button>
                                </div>
                              ) : (
                                <button type="button" onClick={() => addToCart(item)}
                                  className="text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                                  style={{ backgroundColor: '#B90F45' }}>
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
            )
          })()}
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category} ref={el => { categoryRefs.current[category] = el }}>
              <h2 className="font-black text-white text-lg mb-3 flex items-center gap-2">
                <span className="flex-1">{category}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#B90F45' }}>{catItems.length}</span>
              </h2>
              <div className="space-y-2">
                {catItems.map(item => {
                  const inCart = cart.find(c => c.item.id === item.id)
                  return (
                    <div key={item.id}
                      className={`rounded-2xl flex overflow-hidden transition-all ${!item.available ? 'opacity-50' : ''}`}
                      style={{ backgroundColor: '#0d0d0d' }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name}
                          className="w-24 h-24 object-cover shrink-0" />
                      ) : (
                        <div className="w-24 h-24 shrink-0 flex items-center justify-center text-3xl" style={{ backgroundColor: '#1a1a1a' }}>🍽</div>
                      )}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start gap-1">
                            <h4 className="font-bold text-white text-sm leading-tight flex-1">{item.name}</h4>
                            {!item.available && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 text-white" style={{ backgroundColor: '#7f1d1d' }}>Agotado</span>
                            )}
                            {FEATURES.favorites.enabled && (
                              <button type="button" onClick={() => toggleFavorite(item.id)}
                                className={`shrink-0 text-base leading-none transition-transform active:scale-125 ${favorites.includes(item.id) ? '' : 'opacity-30'}`}
                                style={{ color: favorites.includes(item.id) ? '#B90F45' : 'white' }}>
                                {favorites.includes(item.id) ? '❤️' : '🤍'}
                              </button>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-black text-sm" style={{ color: '#B90F45' }}>${item.price.toFixed(2)}</span>
                          {item.available && (
                            inCart ? (
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => changeQty(item.id, -1)}
                                  className="w-7 h-7 rounded-full font-black text-base flex items-center justify-center text-white"
                                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #B90F45' }}>−</button>
                                <span className="font-black text-white text-sm w-4 text-center">{inCart.qty}</span>
                                <button type="button" onClick={() => changeQty(item.id, 1)}
                                  className="w-7 h-7 rounded-full font-black text-base flex items-center justify-center text-white"
                                  style={{ backgroundColor: '#B90F45' }}>+</button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => addToCart(item)}
                                className="text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                                style={{ backgroundColor: '#B90F45' }}>
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
          ))}
          </>
        )}
      </div>

      {/* Cart bar */}
      {cartCount > 0 && !showOrder && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-1">
          <button type="button" onClick={() => setShowOrder(true)}
            className="w-full max-w-2xl mx-auto flex items-center justify-between text-white font-bold py-4 px-5 rounded-2xl shadow-2xl"
            style={{ backgroundColor: '#B90F45' }}>
            <span className="flex items-center gap-2">
              <span className="bg-white font-black text-xs w-6 h-6 rounded-full flex items-center justify-center" style={{ color: '#B90F45' }}>{cartCount}</span>
              Ver pedido
            </span>
            <span className="font-black">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Order modal */}
      {showOrder && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-end backdrop-blur-sm">
          <div className="w-full rounded-t-3xl p-6 pb-10 space-y-4 max-h-[92vh] overflow-y-auto" style={{ backgroundColor: '#0d0d0d' }}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-white">Tu pedido</h2>
              <button type="button" onClick={() => setShowOrder(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: '#1a1a1a' }}>×</button>
            </div>

            <div className="space-y-2">
              {cart.map(c => (
                <div key={c.item.id} className="flex items-center gap-3 py-1 border-b border-[#1a1a1a]">
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
                  <span className="text-sm font-black text-white w-14 text-right shrink-0">${(c.item.price * c.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl px-4 py-3 flex justify-between font-black text-white text-lg" style={{ backgroundColor: '#1a1a1a' }}>
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
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
