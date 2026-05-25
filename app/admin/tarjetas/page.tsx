'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: '#080b16', card: '#0e1225', accent: '#00e676',
  text: '#eef2f7', sub: '#6b7a94', border: 'rgba(255,255,255,0.07)',
}

interface LoyaltyCard {
  id: string; name: string; phone: string; visits: number
  active: boolean; expiresAt?: string; registeredAt: string
  stamps: { timestamp: string; visitsAfter: number }[]
}

function daysLeft(iso?: string) {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

function lastVisit(card: LoyaltyCard) {
  const last = card.stamps.at(-1)?.timestamp ?? card.registeredAt
  return Math.floor((Date.now() - new Date(last).getTime()) / 86400000)
}

function timeAgo(days: number) {
  if (days === 0) return 'hoy'
  if (days === 1) return 'hace 1 día'
  if (days < 30) return `hace ${days} días`
  if (days < 60) return 'hace 1 mes'
  return `hace ${Math.floor(days / 30)} meses`
}

export default function AdminTarjetasPage() {
  const [cards, setCards] = useState<LoyaltyCard[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todas' | 'activas' | 'inactivas' | 'vencidas'>('todas')
  const [inactiveDays, setInactiveDays] = useState(30)

  async function load() {
    const r = await fetch('/api/loyalty')
    if (r.ok) setCards(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleCard(card: LoyaltyCard) {
    const action = card.active ? 'deactivate' : 'activate'
    await fetch(`/api/loyalty/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    load()
  }

  async function deleteCard(id: string) {
    if (!confirm('¿Eliminar esta tarjeta?')) return
    await fetch(`/api/loyalty/${id}`, { method: 'DELETE' })
    load()
  }

  async function deactivateInactive() {
    const inactive = cards.filter(c => c.active && lastVisit(c) >= inactiveDays)
    if (inactive.length === 0) { alert('No hay tarjetas inactivas con ese plazo.'); return }
    if (!confirm(`¿Desactivar ${inactive.length} tarjeta(s) sin visita en ${inactiveDays} días?`)) return
    await Promise.all(inactive.map(c =>
      fetch(`/api/loyalty/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deactivate' }) })
    ))
    load()
  }

  const filtered = cards.filter(c => {
    const days = daysLeft(c.expiresAt)
    if (filter === 'activas') return c.active
    if (filter === 'inactivas') return !c.active
    if (filter === 'vencidas') return days !== null && days <= 0
    return true
  })

  const stats = {
    total: cards.length,
    activas: cards.filter(c => c.active).length,
    inactivas: cards.filter(c => !c.active).length,
    vencidas: cards.filter(c => { const d = daysLeft(c.expiresAt); return d !== null && d <= 0 }).length,
  }

  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[1100px] mx-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-black" style={{ color: S.text }}>Tarjetas de Fidelización</h1>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Activar, desactivar y gestionar tarjetas</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: S.accent },
            { label: 'Activas', value: stats.activas, color: '#4ade80' },
            { label: 'Inactivas', value: stats.inactivas, color: '#f87171' },
            { label: 'Vencidas', value: stats.vencidas, color: '#fb923c' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: S.sub }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Desactivar inactivos */}
        <div className="rounded-2xl p-4 flex flex-wrap items-center gap-3" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <p className="text-sm font-bold flex-1" style={{ color: S.text }}>Desactivar sin visita en:</p>
          <select value={inactiveDays} onChange={e => setInactiveDays(Number(e.target.value))}
            className="px-3 py-2 rounded-xl text-sm font-bold outline-none"
            style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }}>
            {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>{d} días</option>)}
          </select>
          <button onClick={deactivateInactive}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ backgroundColor: 'rgba(239,68,68,.15)', color: '#f87171' }}>
            Desactivar inactivas
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {(['todas', 'activas', 'inactivas', 'vencidas'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all"
              style={filter === f
                ? { backgroundColor: S.accent, color: '#000' }
                : { backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
              {f}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-12 text-sm" style={{ color: S.sub }}>Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm rounded-2xl" style={{ color: S.sub, backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            No hay tarjetas en este filtro
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(card => {
              const days = daysLeft(card.expiresAt)
              const sinVisita = lastVisit(card)
              const expired = days !== null && days <= 0
              return (
                <div key={card.id} className="rounded-2xl p-4 flex flex-wrap items-center gap-3"
                  style={{ backgroundColor: S.card, border: `1px solid ${expired ? 'rgba(251,146,60,.3)' : !card.active ? 'rgba(239,68,68,.2)' : S.border}` }}>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                    style={{ backgroundColor: card.active ? `${S.accent}22` : 'rgba(239,68,68,.15)', color: card.active ? S.accent : '#f87171' }}>
                    {card.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm" style={{ color: S.text }}>{card.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={card.active
                          ? { backgroundColor: 'rgba(0,230,118,.12)', color: '#4ade80' }
                          : { backgroundColor: 'rgba(239,68,68,.12)', color: '#f87171' }}>
                        {card.active ? 'Activa' : 'Inactiva'}
                      </span>
                      {expired && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: 'rgba(251,146,60,.12)', color: '#fb923c' }}>Vencida</span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-0.5 flex-wrap">
                      <p className="text-xs" style={{ color: S.sub }}>📱 {card.phone}</p>
                      <p className="text-xs" style={{ color: S.sub }}>Sellos: {card.visits}/5</p>
                      <p className="text-xs" style={{ color: sinVisita > 30 ? '#fb923c' : S.sub }}>
                        Última visita: {timeAgo(sinVisita)}
                      </p>
                      {days !== null && (
                        <p className="text-xs" style={{ color: days <= 7 ? '#fb923c' : S.sub }}>
                          {days > 0 ? `Vence en ${days} días` : 'Vencida'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => toggleCard(card)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={card.active
                        ? { backgroundColor: 'rgba(239,68,68,.12)', color: '#f87171' }
                        : { backgroundColor: `${S.accent}20`, color: S.accent }}>
                      {card.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => deleteCard(card.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ backgroundColor: 'rgba(239,68,68,.08)', color: '#f87171' }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
