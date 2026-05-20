'use client'

import { useState, useEffect } from 'react'
import CustomerNav from '../components/CustomerNav'

interface Review {
  id: string; customerName: string; rating: number; comment: string; createdAt: string
}

const RATING_LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']
const RATING_COLORS = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-emerald-600']

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className={`text-4xl transition-all active:scale-90 ${
              i <= active ? 'text-yellow-400 scale-110' : 'text-gray-200'
            }`}>
            ★
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className={`text-sm font-bold ${RATING_COLORS[active]}`}>{RATING_LABELS[active]}</p>
      )}
    </div>
  )
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">
      {'★'.repeat(rating)}<span className="text-gray-200">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase()
}

const AVATAR_COLORS = ['bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-orange-500']

function avatarColor(name: string) {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[i]
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

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      {/* Header */}
      <div className="bg-amber-900 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3.5">
          <h1 className="font-black text-base tracking-tight">☕ Chubis — Reseñas</h1>
        </div>
      </div>

      {/* Rating summary */}
      {avg && (
        <div className="bg-amber-900 text-white">
          <div className="max-w-2xl mx-auto px-4 pb-5 flex items-center gap-4">
            <span className="text-5xl font-black text-amber-300">{avg}</span>
            <div>
              <StarDisplay rating={Math.round(Number(avg))} />
              <p className="text-amber-300 text-xs mt-0.5">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4 space-y-5">

        {/* Form */}
        <section className="bg-white rounded-3xl shadow-md overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-100 px-5 py-4">
            <h2 className="text-base font-black text-amber-900">Deja tu reseña</h2>
            <p className="text-xs text-amber-700 mt-0.5">Tu opinión nos ayuda a mejorar</p>
          </div>

          {reviewSuccess ? (
            <div className="p-8 text-center">
              <p className="text-5xl mb-3">🎉</p>
              <p className="font-black text-xl text-green-700">¡Gracias por tu reseña!</p>
              <p className="text-sm text-gray-500 mt-1">Tu opinión ya fue enviada</p>
              <button type="button" onClick={() => setReviewSuccess(false)}
                className="mt-4 text-sm text-amber-700 font-semibold underline">
                Escribir otra reseña
              </button>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Calificación</label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Tu nombre</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                  placeholder="Ej. María González"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Comentario</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Cuéntanos tu experiencia..." rows={3}
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-amber-500 resize-none transition-colors" />
              </div>
              {reviewError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">{reviewError}</div>
              )}
              <button type="button" onClick={submitReview} disabled={submitting}
                className="w-full bg-amber-800 active:bg-amber-950 text-white font-black py-4 rounded-2xl text-base disabled:opacity-60 transition-colors">
                {submitting ? 'Enviando...' : '★ Enviar reseña'}
              </button>
            </div>
          )}
        </section>

        {/* Published reviews */}
        {loadingReviews ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded-full w-1/3" />
                    <div className="h-3 bg-gray-200 rounded-full w-1/4" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-5xl mb-3">💬</p>
            <p className="font-semibold">Aún no hay reseñas</p>
            <p className="text-sm mt-1">¡Sé el primero en opinar!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-black text-gray-700 text-sm uppercase tracking-wide px-1">
              Lo que dicen nuestros clientes
            </h3>
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 ${avatarColor(review.customerName)}`}>
                    {initial(review.customerName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-gray-900 text-sm truncate">{review.customerName}</p>
                      <p className="text-xs text-gray-400 shrink-0">{fmtDate(review.createdAt)}</p>
                    </div>
                    <StarDisplay rating={review.rating} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-13">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <CustomerNav active="review" />
    </div>
  )
}
