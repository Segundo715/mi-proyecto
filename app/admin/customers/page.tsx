'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

interface Stamp { timestamp: string; visitsAfter: number }
interface Customer {
  id: string; name: string; phone: string; visits: number
  confirmed: boolean; registeredAt: string; stamps: Stamp[]; requestedAt?: string
}

const STAMPS = 5

const S = {
  bg:     '#080b16',
  card:   '#0e1225',
  accent: '#00e676',
  text:   '#eef2f7',
  sub:    '#6b7a94',
  border: 'rgba(255,255,255,0.07)',
}

function initial(name: string) { return name.trim().charAt(0).toUpperCase() }

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 90) return 'hace un momento'
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  return fmt(iso)
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    const res = await fetch('/api/customers')
    if (res.ok) setCustomers(await res.json())
    setLoading(false)
  }

  async function activate(id: string) {
    await fetch(`/api/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'confirm' }),
    })
    load()
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) return
    await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    load()
  }

  function waLink(c: Customer) {
    const link = `${origin}/activate?id=${c.id}`
    const msg = encodeURIComponent(`¡Hola ${c.name}! 🎉 Tu tarjeta Chubis ☕ está lista.\n\nActívala aquí:\n${link}\n\n¡Gracias!`)
    return `https://wa.me/${c.phone.replace(/\D/g, '')}?text=${msg}`
  }

  const pending = customers.filter(c => !c.confirmed)
  const confirmed = customers.filter(c => c.confirmed)
  const checkIns = customers.filter(c => c.requestedAt && Date.now() - new Date(c.requestedAt).getTime() < 3 * 60 * 1000)

  const sorted = [...confirmed].sort((a, b) => {
    const aT = a.stamps.at(-1)?.timestamp ?? a.registeredAt
    const bT = b.stamps.at(-1)?.timestamp ?? b.registeredAt
    return bT.localeCompare(aT)
  })

  const filtered = search.trim()
    ? sorted.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
    : sorted

  const totalStamps = confirmed.reduce((s, c) => s + c.visits, 0)
  const readyForCoffee = confirmed.filter(c => c.visits >= STAMPS).length

  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <AdminNav />

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Check-in alerts */}
        {checkIns.map(c => (
          <div key={c.id} className="rounded-2xl p-4 flex items-center gap-3"
            style={{ backgroundColor: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.4)' }}>
            <span className="text-3xl animate-bounce">🔔</span>
            <div className="flex-1">
              <p className="font-black text-base" style={{ color: S.accent }}>{c.name} está en el mostrador</p>
              <p className="text-xs" style={{ color: S.sub }}>{c.phone} · {c.visits}/{STAMPS} sellos · {timeAgo(c.requestedAt!)}</p>
            </div>
          </div>
        ))}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Clientes', value: confirmed.length, emoji: '👥', color: S.accent },
            { label: 'Sellos totales', value: totalStamps, emoji: '☕', color: S.accent },
            { label: 'Premio listo', value: readyForCoffee, emoji: '🎉', color: '#fbbf24' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <p className="text-2xl">{s.emoji}</p>
              <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: S.sub }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pending activation */}
        {pending.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: 'rgba(239,68,68,0.15)', borderBottom: `1px solid ${S.border}` }}>
              <span className="text-lg">⏳</span>
              <p className="font-black text-sm" style={{ color: '#f87171' }}>Pendientes de activación ({pending.length})</p>
            </div>
            <div className="p-3 space-y-3">
              {pending.map(c => (
                <div key={c.id} className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black shrink-0"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#4f6ef7)' }}>
                      {initial(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold" style={{ color: S.text }}>{c.name}</p>
                      <p className="text-sm" style={{ color: S.sub }}>{c.phone}</p>
                      <p className="text-xs" style={{ color: S.sub }}>{timeAgo(c.registeredAt)}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full shrink-0"
                      style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>Pendiente</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => activate(c.id)}
                      className="flex-1 font-bold py-2.5 rounded-xl text-sm"
                      style={{ backgroundColor: S.accent, color: '#000' }}>
                      ✅ Activar
                    </button>
                    {c.phone && (
                      <a href={waLink(c)} target="_blank" rel="noopener noreferrer"
                        className="flex-1 font-bold py-2.5 rounded-xl text-sm text-center"
                        style={{ backgroundColor: '#22c55e', color: '#000' }}>
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active customers header */}
        <div className="flex items-center justify-between">
          <h2 className="font-black text-base" style={{ color: S.text }}>Clientes activos</h2>
          <button type="button" onClick={load}
            className="text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ backgroundColor: 'rgba(0,230,118,0.1)', color: S.accent, border: '1px solid rgba(0,230,118,0.3)' }}>
            ↻ Actualizar
          </button>
        </div>

        {/* Search */}
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none transition-colors"
          style={{ backgroundColor: S.card, color: S.text, border: `1px solid ${S.border}` }} />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl p-4 animate-pulse flex gap-3" style={{ backgroundColor: S.card }}>
                <div className="w-12 h-12 rounded-full shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 rounded-full w-1/2" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
                  <div className="h-3 rounded-full w-1/3" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                  <div className="h-2 rounded-full w-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14" style={{ color: S.sub }}>
            <p className="text-5xl mb-3">{search ? '🔍' : '☕'}</p>
            <p className="font-semibold" style={{ color: S.text }}>{search ? 'Sin resultados' : 'Aún no hay clientes activos'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c.id} className="rounded-2xl p-4"
                style={{
                  backgroundColor: S.card,
                  border: c.visits >= STAMPS ? '2px solid rgba(251,191,36,0.5)' : `1px solid ${S.border}`,
                  boxShadow: c.visits >= STAMPS ? '0 0 0 1px rgba(251,191,36,0.2)' : 'none',
                }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shrink-0"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#4f6ef7)' }}>
                    {initial(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold truncate" style={{ color: S.text }}>{c.name}</p>
                      {c.visits >= STAMPS && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>🎉 Premio</span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: S.sub }}>{c.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-lg leading-none" style={{ color: S.accent }}>{c.visits}/{STAMPS}</p>
                    <p className="text-xs" style={{ color: S.sub }}>sellos</p>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="flex gap-2 mb-3">
                  {Array.from({ length: STAMPS }).map((_, i) => (
                    <div key={i} className="flex-1 h-2 rounded-full transition-all"
                      style={{ backgroundColor: i < c.visits ? S.accent : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs mb-3" style={{ color: S.sub }}>
                  <span>Registrado {timeAgo(c.registeredAt)}</span>
                  {c.stamps.at(-1) && <span>Último sello {timeAgo(c.stamps.at(-1)!.timestamp)}</span>}
                </div>

                <button type="button" onClick={() => remove(c.id)}
                  className="w-full rounded-xl py-2 text-sm font-semibold transition-colors"
                  style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.08)' }}>
                  🗑 Eliminar cliente
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
