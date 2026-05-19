'use client'

import { useState, useEffect } from 'react'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  available: boolean
}

interface Review {
  id: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

function Stars({ rating, interactive, onSelect }: {
  rating: number
  interactive?: boolean
  onSelect?: (r: number) => void
}) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onSelect?.(i)}
          className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </span>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)

  // Review form state
  const [rating, setRating] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.ok ? r.json() : [])
      .then((data: MenuItem[]) => { setItems(data); setLoadingMenu(false) })
      .catch(() => setLoadingMenu(false))

    fetch('/api/reviews')
      .then(r => r.ok ? r.json() : [])
      .then((data: Review[]) => { setReviews(data); setLoadingReviews(false) })
      .catch(() => setLoadingReviews(false))
  }, [])

  async function submitReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setReviewError('')
    if (rating === 0) { setReviewError('Por favor selecciona una calificación.'); return }
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
        setReviewSuccess(true)
        setRating(0)
        setCustomerName('')
        setComment('')
        // Refresh published reviews
        const r2 = await fetch('/api/reviews')
        if (r2.ok) setReviews(await r2.json())
      } else {
        const data = await res.json()
        setReviewError(data.error ?? 'Error al enviar la reseña')
      }
    } catch {
      setReviewError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // Group menu items by category
  const grouped: Record<string, MenuItem[]> = {}
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Top nav */}
      <div className="bg-amber-900 text-white sticky top-0 z-20 shadow">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-base">☕ Chubis — Menú</h1>
          <a
            href="/"
            className="text-sm bg-amber-800 hover:bg-amber-700 px-3 py-1 rounded-lg font-medium"
          >
            Mi tarjeta
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-8">
        {/* Menu section */}
        <section>
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Nuestro menú</h2>

          {loadingMenu ? (
            <div className="text-center py-10 text-amber-700">Cargando menú...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">🍽</p>
              <p>El menú aún no está disponible</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, categoryItems]) => (
              <div key={category} className="mb-6">
                <h3 className="font-bold text-amber-800 text-lg mb-3 border-b border-amber-200 pb-1">
                  {category}
                </h3>
                <div className="space-y-3">
                  {categoryItems.map(item => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl shadow p-4 flex gap-3 ${!item.available ? 'opacity-60' : ''}`}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-900">{item.name}</h4>
                          {!item.available && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                              No disponible
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                        )}
                        <span className="inline-block mt-1 text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Review form */}
        <section className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Deja tu reseña</h2>

          {reviewSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-center font-semibold">
              ¡Gracias por tu reseña!
            </div>
          ) : (
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-1">Calificación *</label>
                <Stars rating={rating} interactive onSelect={setRating} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-1">Tu nombre *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Ej. María González"
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-1">Comentario *</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Cuéntanos tu experiencia..."
                  rows={3}
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {reviewError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {reviewError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-700 active:bg-amber-900 text-white font-bold py-3 rounded-xl disabled:opacity-60"
              >
                {submitting ? 'Enviando...' : 'Enviar reseña'}
              </button>
            </form>
          )}
        </section>

        {/* Published reviews */}
        <section>
          <h2 className="text-xl font-bold text-amber-900 mb-4">Lo que dicen nuestros clientes</h2>

          {loadingReviews ? (
            <div className="text-center py-6 text-amber-700">Cargando reseñas...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p>Aún no hay reseñas publicadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl shadow p-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-gray-900">{review.customerName}</p>
                    <p className="text-xs text-gray-400">{fmtDate(review.createdAt)}</p>
                  </div>
                  <Stars rating={review.rating} />
                  <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
