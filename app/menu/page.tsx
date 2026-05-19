'use client'

import { useState, useEffect } from 'react'
import CustomerNav from '../components/CustomerNav'

interface MenuItem {
  id: string; name: string; description: string; price: number
  category: string; imageUrl?: string; available: boolean
}

interface Review {
  id: string; customerName: string; rating: number; comment: string; createdAt: string
}

interface CartItem { item: MenuItem; qty: number }

function Stars({ rating, interactive, onSelect }: { rating: number; interactive?: boolean; onSelect?: (r: number) => void }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" disabled={!interactive} onClick={() => onSelect?.(i)}
          className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
      ))}
    </span>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)

  // Cart
  const [cart, setCart] = useState<CartItem[]>([])
  const [showOrder, setShowOrder] = useState(false)
  const [orderName, setOrderName] = useState('')
  const [orderTable, setOrderTable] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  // Review form
  const [rating, setRating] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/menu').then(r => r.ok ? r.json() : []).then((d: MenuItem[]) => { setItems(d); setLoadingMenu(false) }).catch(() => setLoadingMenu(false))
    fetch('/api/reviews').then(r => r.ok ? r.json() : []).then((d: Review[]) => { setReviews(d); setLoadingReviews(false) }).catch(() => setLoadingReviews(false))
  }, [])

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
        setCart([]); setShowOrder(false); setOrderName(''); setOrderTable(''); setOrderNotes(''); setOrderSuccess(true)
        setTimeout(() => setOrderSuccess(false), 4000)
      }
    } finally {
      setOrderSubmitting(false)
    }
  }

  async function submitReview() {
    setReviewError('')
    if (rating === 0) { setReviewError('Selecciona una calificación.'); return }
    if (!customerName.trim()) { setReviewError('El nombre es obligatorio.'); return }
    if (!comment.trim()) { setReviewError('El comentario es obligatorio.'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, customerName: customerName.trim(), comment: comment.trim() }),
      })
      if (res.ok) {
        setReviewSuccess(true); setRating(0); setCustomerName(''); setComment('')
        const r2 = await fetch('/api/reviews')
        if (r2.ok) setReviews(await r2.json())
      } else {
        const d = await res.json()
        setReviewError(d.error ?? 'Error al enviar la reseña')
      }
    } catch {
      setReviewError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const grouped: Record<string, MenuItem[]> = {}
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-32">
      {/* Header */}
      <div className="bg-amber-900 text-white sticky top-0 z-20 shadow">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-base">☕ Chubis — Menú</h1>
        </div>
      </div>

      {/* Order success toast */}
      {orderSuccess && (
        <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4">
          <div className="bg-green-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg">
            ✅ ¡Pedido enviado! Lo prepararemos pronto.
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4 space-y-8">
        {/* Menu items */}
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

        {/* Review form */}
        <section className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Deja tu reseña</h2>
          {reviewSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-center font-semibold">¡Gracias por tu reseña!</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-1">Calificación *</label>
                <Stars rating={rating} interactive onSelect={setRating} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-1">Tu nombre *</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Ej. María González"
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-1">Comentario *</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Cuéntanos tu experiencia..." rows={3}
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 resize-none" />
              </div>
              {reviewError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{reviewError}</div>}
              <button type="button" onClick={submitReview} disabled={submitting} className="w-full bg-amber-700 active:bg-amber-900 text-white font-bold py-3 rounded-xl disabled:opacity-60">
                {submitting ? 'Enviando...' : 'Enviar reseña'}
              </button>
            </div>
          )}
        </section>

        {/* Published reviews */}
        <section>
          <h2 className="text-xl font-bold text-amber-900 mb-4">Lo que dicen nuestros clientes</h2>
          {loadingReviews ? (
            <div className="text-center py-6 text-amber-700">Cargando reseñas...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-6 text-gray-400"><p>Aún no hay reseñas publicadas</p></div>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl shadow p-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-gray-900">{review.customerName}</p>
                    <p className="text-xs text-gray-400">{fmtDate(review.createdAt)}</p>
                  </div>
                  <Stars rating={review.rating} />
                  <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Cart bar */}
      {cartCount > 0 && !showOrder && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4">
          <button type="button" onClick={() => setShowOrder(true)}
            className="w-full max-w-2xl mx-auto block bg-amber-700 active:bg-amber-900 text-white font-bold py-4 rounded-2xl shadow-xl">
            🛒 Ver pedido ({cartCount}) — ${cartTotal.toFixed(2)}
          </button>
        </div>
      )}

      {/* Order modal */}
      {showOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
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

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between font-bold text-gray-900 text-base mb-4">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-1">Tu nombre *</label>
                  <input type="text" value={orderName} onChange={e => setOrderName(e.target.value)} placeholder="Ej. María"
                    className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-1">Mesa (opcional)</label>
                  <input type="text" value={orderTable} onChange={e => setOrderTable(e.target.value)} placeholder="Ej. 3"
                    className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-1">Notas (opcional)</label>
                  <input type="text" value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="Sin cebolla, extra salsa..."
                    className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              <button type="button" onClick={submitOrder} disabled={orderSubmitting || !orderName.trim()}
                className="mt-4 w-full bg-amber-700 active:bg-amber-900 text-white font-bold py-4 rounded-2xl disabled:opacity-60">
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
