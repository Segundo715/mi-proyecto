'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

interface Review {
  id: string; customerName: string; rating: number; comment: string
  createdAt: string; published: boolean; bad: boolean
}

const AVATAR_COLORS = ['bg-amber-500','bg-rose-500','bg-violet-500','bg-sky-500','bg-emerald-500','bg-orange-500']
function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] }
function initial(name: string) { return name.trim().charAt(0).toUpperCase() }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span>
      <span className="text-yellow-400">{'★'.repeat(rating)}</span>
      <span className="text-gray-200">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'good' | 'bad'>('good')

  useEffect(() => { fetchReviews() }, [])

  async function fetchReviews() {
    setLoading(true)
    try {
      const res = await fetch('/api/reviews?all=1')
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

  const avgGood = goodReviews.length
    ? (goodReviews.reduce((s, r) => s + r.rating, 0) / goodReviews.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />

      <div className="max-w-3xl mx-auto p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Publicadas', value: goodReviews.filter(r => r.published).length, emoji: '✅', color: 'text-green-700' },
            { label: 'Promedio', value: avgGood ? `${avgGood}★` : '—', emoji: '⭐', color: 'text-amber-700' },
            { label: 'Negativas', value: badReviews.length, emoji: '📧', color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm p-3 text-center">
              <p className="text-2xl">{s.emoji}</p>
              <p className={`font-black text-xl ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex p-1.5 gap-1.5 bg-white rounded-2xl shadow-sm">
          <button type="button" onClick={() => setTab('good')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'good' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
            }`}>
            ✅ Buenas
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${tab === 'good' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
              {goodReviews.length}
            </span>
          </button>
          <button type="button" onClick={() => setTab('bad')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'bad' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
            }`}>
            📧 Negativas
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${tab === 'bad' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
              {badReviews.length}
            </span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded-full w-1/3" />
                  <div className="h-3 bg-gray-100 rounded-full w-full" />
                  <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">{tab === 'good' ? '😊' : '😌'}</p>
            <p className="font-semibold text-lg">{tab === 'good' ? 'No hay reseñas buenas aún' : '¡Sin reseñas negativas!'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(review => (
              <div key={review.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${
                  review.bad ? 'border-red-400' : review.published ? 'border-green-400' : 'border-amber-300'
                }`}>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black shrink-0 ${avatarColor(review.customerName)}`}>
                      {initial(review.customerName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-900">{review.customerName}</p>
                        <p className="text-xs text-gray-400 shrink-0">{fmtDate(review.createdAt)}</p>
                      </div>
                      <StarDisplay rating={review.rating} />
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">{review.comment}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {review.bad && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-bold">📧 Enviado por email</span>
                    )}
                    {review.published && (
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold">✅ Publicada</span>
                    )}
                    {!review.bad && !review.published && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-bold">Oculta</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 flex">
                  {!review.bad && (
                    <button type="button" onClick={() => togglePublish(review)}
                      className={`flex-1 py-3 text-sm font-bold transition-colors border-r border-gray-100 ${
                        review.published
                          ? 'text-orange-600 hover:bg-orange-50 active:bg-orange-100'
                          : 'text-green-700 hover:bg-green-50 active:bg-green-100'
                      }`}>
                      {review.published ? 'Despublicar' : 'Publicar'}
                    </button>
                  )}
                  <button type="button" onClick={() => deleteReview(review.id)}
                    className="flex-1 py-3 text-sm font-bold text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
