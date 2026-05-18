'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

interface Review {
  id: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
  published: boolean
  bad: boolean
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'⭐'.repeat(rating)}
      {'☆'.repeat(Math.max(0, 5 - rating))}
    </span>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'good' | 'bad'>('good')

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    setLoading(true)
    try {
      const res = await fetch('/api/reviews')
      if (res.ok) setReviews(await res.json())
    } finally {
      setLoading(false)
    }
  }

  async function togglePublish(review: Review) {
    await fetch(`/api/reviews/${review.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !review.published }),
    })
    fetchReviews()
  }

  async function deleteReview(id: string) {
    if (!confirm('¿Eliminar esta reseña?')) return
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    fetchReviews()
  }

  const goodReviews = reviews.filter(r => !r.bad)
  const badReviews = reviews.filter(r => r.bad)

  const displayed = tab === 'good' ? goodReviews : badReviews

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold text-amber-900">Gestión de Reseñas</h1>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('good')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              tab === 'good'
                ? 'bg-green-600 text-white'
                : 'bg-white border-2 border-green-200 text-green-700'
            }`}
          >
            Buenas (publicadas) — {goodReviews.length}
          </button>
          <button
            onClick={() => setTab('bad')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              tab === 'bad'
                ? 'bg-red-600 text-white'
                : 'bg-white border-2 border-red-200 text-red-700'
            }`}
          >
            Malas (email) — {badReviews.length}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-amber-700">Cargando...</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">{tab === 'good' ? '😊' : '😞'}</p>
            <p>No hay reseñas en esta sección</p>
          </div>
        ) : (
          displayed.map(review => (
            <div
              key={review.id}
              className={`bg-white rounded-2xl shadow p-4 border-l-4 ${
                review.bad ? 'border-red-400' : 'border-green-400'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-900">{review.customerName}</p>
                  <Stars rating={review.rating} />
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(review.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {review.bad && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                      📧 Enviado por email
                    </span>
                  )}
                  {review.published && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Publicada
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePublish(review)}
                  className={`flex-1 py-1.5 rounded-xl text-sm font-medium border-2 ${
                    review.published
                      ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {review.published ? 'Despublicar' : 'Publicar'}
                </button>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="flex-1 py-1.5 rounded-xl text-sm font-medium border-2 border-red-200 text-red-500 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
