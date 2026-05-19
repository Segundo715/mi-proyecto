'use client'

import { useState, useEffect } from 'react'
import CustomerNav from '../components/CustomerNav'

interface Review {
  id: string; customerName: string; rating: number; comment: string; createdAt: string
}

function Stars({ rating, interactive, onSelect }: { rating: number; interactive?: boolean; onSelect?: (r: number) => void }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" disabled={!interactive} onClick={() => onSelect?.(i)}
          className={`text-3xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
      ))}
    </span>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [rating, setRating] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [])

  async function loadReviews() {
    setLoadingReviews(true)
    try {
      const r = await fetch('/api/reviews')
      if (r.ok) setReviews(await r.json())
    } finally {
      setLoadingReviews(false)
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
        loadReviews()
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

  return (
    <div className="min-h-screen bg-amber-50 pb-24">
      <div className="bg-amber-900 text-white sticky top-0 z-20 shadow">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="font-bold text-base">☕ Chubis — Reseñas</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Form */}
        <section className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Deja tu reseña</h2>
          {reviewSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-center font-semibold">
              ¡Gracias por tu reseña! 🎉
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">Calificación *</label>
                <Stars rating={rating} interactive onSelect={setRating} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-1">Tu nombre *</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                  placeholder="Ej. María González"
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-1">Comentario *</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Cuéntanos tu experiencia..." rows={3}
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-amber-500 resize-none" />
              </div>
              {reviewError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{reviewError}</div>
              )}
              <button type="button" onClick={submitReview} disabled={submitting}
                className="w-full bg-amber-700 active:bg-amber-900 text-white font-bold py-3 rounded-xl disabled:opacity-60">
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

      <CustomerNav active="review" />
    </div>
  )
}
