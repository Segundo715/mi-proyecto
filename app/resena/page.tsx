'use client'

import { useState } from 'react'

type Step = 'form' | 'success'

export default function ResenaPage() {
  const [step, setStep] = useState<Step>('form')
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!name.trim()) { setError('Ingresa tu nombre'); return }
    if (!rating) { setError('Selecciona una calificación'); return }
    if (!comment.trim()) { setError('Escribe tu comentario'); return }
    if (comment.trim().length < 10) { setError('El comentario debe tener al menos 10 caracteres'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name.trim(), rating, comment: comment.trim() }),
      })
      if (res.ok) {
        setStep('success')
      } else {
        const d = await res.json()
        setError(d.error ?? 'Error al enviar')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep('form')
    setName('')
    setRating(0)
    setHovered(0)
    setComment('')
    setError('')
  }

  const ratingLabels: Record<number, string> = {
    1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Bueno', 5: 'Excelente',
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="w-full max-w-sm text-center space-y-6">
          <img src="/logo.png" alt="NICHO" className="h-24 w-auto mx-auto" />
          <div className="rounded-3xl p-8 space-y-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #B90F45' }}>
            <div className="text-5xl">{rating >= 4 ? '🌟' : '🙏'}</div>
            <h2 className="text-2xl font-black text-white">¡Gracias por tu reseña!</h2>
            <p className="text-sm" style={{ color: '#aaa' }}>
              {rating >= 4
                ? 'Nos alegra que hayas tenido una gran experiencia. ¡Esperamos verte pronto!'
                : 'Tu opinión nos ayuda a mejorar. Tomaremos en cuenta tus comentarios.'}
            </p>
            {'★'.repeat(rating).split('').map((_, i) => (
              <span key={i} className="text-2xl text-yellow-400">★</span>
            ))}
          </div>
          <button onClick={reset} className="text-sm font-semibold" style={{ color: '#B90F45' }}>
            Dejar otra reseña
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0d0d0d' }}>

      {/* Header rojo */}
      <div className="relative flex flex-col items-center pt-10 pb-6 px-4"
        style={{ background: 'linear-gradient(180deg, #B90F45 0%, #7a0a2e 70%, #0d0d0d 100%)' }}>
        <img src="/logo.png" alt="NICHO" className="h-20 w-auto mb-3" />
        <p className="text-white font-black text-base tracking-widest text-center">Deja tu reseña</p>
      </div>

      {/* Formulario */}
      <div className="flex-1 px-5 pb-10 max-w-sm mx-auto w-full space-y-5 pt-4">

        {/* Tarjeta intro */}
        <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#111', border: '1px solid #B90F45' }}>
          <p className="font-black text-white text-base">¿Cómo fue tu experiencia?</p>
          <p className="text-xs mt-1" style={{ color: '#aaa' }}>Tu opinión nos ayuda a mejorar. Solo toma un minuto.</p>
        </div>

        {/* Nombre */}
        <div>
          <label className="flex items-center gap-2 text-sm font-black text-white mb-2">
            <span style={{ color: '#B90F45' }}>👤</span> Tu nombre *
          </label>
          <input
            type="text" value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="Ej: Juan Pérez"
            className="w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder-gray-500 outline-none"
            style={{ backgroundColor: '#1a1a1a', border: '1.5px solid #333' }}
          />
        </div>

        {/* Estrellas */}
        <div>
          <label className="flex items-center gap-2 text-sm font-black text-white mb-3">
            <span style={{ color: '#B90F45' }}>⭐</span> Calificación *
          </label>
          <div className="flex items-center gap-2 justify-center mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => { setRating(star); setError('') }}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform active:scale-90"
                style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                <span style={{ color: star <= (hovered || rating) ? '#fbbf24' : '#333', transition: 'color 0.1s' }}>★</span>
              </button>
            ))}
          </div>
          {(hovered || rating) > 0 && (
            <p className="text-center text-sm font-bold" style={{ color: '#fbbf24' }}>
              {ratingLabels[hovered || rating]}
            </p>
          )}
        </div>

        {/* Comentario */}
        <div>
          <label className="flex items-center gap-2 text-sm font-black text-white mb-2">
            <span style={{ color: '#B90F45' }}>💬</span> Tu comentario *
          </label>
          <textarea
            value={comment}
            onChange={e => { setComment(e.target.value); setError('') }}
            placeholder="Cuéntanos sobre tu experiencia en NICHO..."
            rows={4}
            className="w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder-gray-500 outline-none resize-none"
            style={{ backgroundColor: '#1a1a1a', border: '1.5px solid #333' }}
          />
          <p className="text-xs mt-1 text-right" style={{ color: comment.length < 10 ? '#555' : '#B90F45' }}>
            {comment.length} / mín. 10 caracteres
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl px-4 py-3 text-sm font-medium text-red-300"
            style={{ backgroundColor: '#2d0a0a', border: '1px solid #7f1d1d' }}>
            {error}
          </div>
        )}

        {/* Botón */}
        <button
          onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 rounded-2xl text-white font-black text-base disabled:opacity-60 transition-all"
          style={{ backgroundColor: '#B90F45' }}>
          {submitting ? 'Enviando...' : '✉️ Enviar reseña'}
        </button>

        <p className="text-xs text-center" style={{ color: '#555' }}>
          Tu reseña es anónima para otros clientes y solo se mostrará con tu nombre de pila.
        </p>
      </div>
    </div>
  )
}
