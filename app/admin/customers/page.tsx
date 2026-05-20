'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

interface Stamp { timestamp: string; visitsAfter: number }
interface Customer {
  id: string; name: string; phone: string; visits: number
  confirmed: boolean; registeredAt: string; stamps: Stamp[]; requestedAt?: string
}

const STAMPS = 5

const AVATAR_COLORS = ['bg-amber-500','bg-rose-500','bg-violet-500','bg-sky-500','bg-emerald-500','bg-orange-500']
function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] }
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
    <div className="min-h-screen bg-gray-100">
      <AdminNav />

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Check-in alerts */}
        {checkIns.map(c => (
          <div key={c.id} className="bg-green-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <span className="text-3xl animate-bounce">🔔</span>
            <div className="flex-1">
              <p className="font-black text-base">{c.name} está en el mostrador</p>
              <p className="text-xs text-green-100">{c.phone} · {c.visits}/{STAMPS} sellos · {timeAgo(c.requestedAt!)}</p>
            </div>
          </div>
        ))}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Clientes', value: confirmed.length, emoji: '👥', color: 'text-amber-700' },
            { label: 'Sellos totales', value: totalStamps, emoji: '☕', color: 'text-amber-700' },
            { label: 'Premio listo', value: readyForCoffee, emoji: '🎉', color: 'text-green-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm p-3 text-center">
              <p className="text-2xl">{s.emoji}</p>
              <p className={`font-black text-xl ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pending activation */}
        {pending.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-red-500 px-4 py-3 flex items-center gap-2">
              <span className="text-white text-lg">⏳</span>
              <p className="text-white font-black text-sm">Pendientes de activación ({pending.length})</p>
            </div>
            <div className="p-3 space-y-3">
              {pending.map(c => (
                <div key={c.id} className="bg-red-50 border border-red-100 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black shrink-0 ${avatarColor(c.name)}`}>
                      {initial(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{c.name}</p>
                      <p className="text-sm text-gray-500">{c.phone}</p>
                      <p className="text-xs text-gray-400">{timeAgo(c.registeredAt)}</p>
                    </div>
                    <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-1 rounded-full shrink-0">Pendiente</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => activate(c.id)}
                      className="flex-1 bg-amber-700 active:bg-amber-900 text-white font-bold py-2.5 rounded-xl text-sm">
                      ✅ Activar
                    </button>
                    {c.phone && (
                      <a href={waLink(c)} target="_blank" rel="noopener noreferrer"
                        className="flex-1 bg-green-500 active:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm text-center">
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active customers */}
        <div className="flex items-center justify-between">
          <h2 className="font-black text-gray-800 text-base">Clientes activos</h2>
          <button type="button" onClick={load} className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full font-semibold">
            ↻ Actualizar
          </button>
        </div>

        {/* Search */}
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-amber-500 transition-colors" />

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                  <div className="h-2 bg-gray-100 rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <p className="text-5xl mb-3">{search ? '🔍' : '☕'}</p>
            <p className="font-semibold">{search ? 'Sin resultados' : 'Aún no hay clientes activos'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c.id} className={`bg-white rounded-2xl shadow-sm p-4 ${c.visits >= STAMPS ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shrink-0 shadow-sm ${avatarColor(c.name)}`}>
                    {initial(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 truncate">{c.name}</p>
                      {c.visits >= STAMPS && <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full shrink-0">🎉 Premio</span>}
                    </div>
                    <p className="text-sm text-gray-500">{c.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-amber-700 text-lg leading-none">{c.visits}/{STAMPS}</p>
                    <p className="text-xs text-gray-400">sellos</p>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="flex gap-2 mb-3">
                  {Array.from({ length: STAMPS }).map((_, i) => (
                    <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < c.visits ? 'bg-amber-500' : 'bg-gray-100'}`} />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>Registrado {timeAgo(c.registeredAt)}</span>
                  {c.stamps.at(-1) && <span>Último sello {timeAgo(c.stamps.at(-1)!.timestamp)}</span>}
                </div>

                <button type="button" onClick={() => remove(c.id)}
                  className="w-full text-red-500 border border-red-100 bg-red-50 rounded-xl py-2 text-sm font-semibold active:bg-red-100 transition-colors">
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
