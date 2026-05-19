'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

interface Stamp { timestamp: string; visitsAfter: number }
interface Customer {
  id: string; name: string; phone: string; visits: number
  confirmed: boolean; registeredAt: string; stamps: Stamp[]; requestedAt?: string
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')

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
  const sorted = [...confirmed].sort((a, b) => {
    const aT = a.stamps.at(-1)?.timestamp ?? a.registeredAt
    const bT = b.stamps.at(-1)?.timestamp ?? b.registeredAt
    return bT.localeCompare(aT)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Check-in notifications */}
        {customers.filter(c => c.requestedAt && Date.now() - new Date(c.requestedAt).getTime() < 3 * 60 * 1000).map(c => (
          <div key={c.id} className="bg-green-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg animate-pulse">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-bold">{c.name} está en el mostrador</p>
              <p className="text-xs text-green-100">{c.phone} · {c.visits}/5 sellos</p>
            </div>
          </div>
        ))}

        {/* Pending activation */}
        {pending.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-red-700 flex items-center gap-2">
              <span className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{pending.length}</span>
              Pendientes de activación
            </h2>
            {pending.map(c => (
              <div key={c.id} className="bg-white rounded-2xl shadow border-l-4 border-red-400 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <p className="text-sm text-gray-500">{c.phone}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Registrado: {fmt(c.registeredAt)}</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-1 rounded-full">Pendiente</span>
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => activate(c.id)}
                    className="w-full bg-amber-600 active:bg-amber-800 text-white font-bold py-2 rounded-xl text-sm"
                  >
                    ✅ Activar tarjeta
                  </button>
                  {c.phone && (
                    <a
                      href={waLink(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-green-500 active:bg-green-700 text-white font-bold py-2 rounded-xl text-sm text-center"
                    >
                      💬 Enviar WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
            <hr className="border-gray-200" />
          </div>
        )}

        {/* Active customers */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-amber-900 text-lg">Activos ({confirmed.length})</h2>
          <button type="button" onClick={load} className="text-sm text-amber-700 underline">Actualizar</button>
        </div>

        {loading && <div className="text-center py-10 text-amber-700">Cargando...</div>}

        {!loading && confirmed.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">☕</p>
            <p>Aún no hay clientes activos</p>
          </div>
        )}

        {sorted.map(c => (
          <div key={c.id} className="bg-white rounded-2xl shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-gray-900">{c.name}</p>
                <p className="text-sm text-gray-500">{c.phone}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.visits >= 5 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {c.visits >= 5 ? '🎉 Premio' : `${c.visits}/5 ☕`}
              </span>
            </div>
            <div className="flex gap-1.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-full ${i < c.visits ? 'bg-amber-500' : 'bg-gray-100'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-400">Registrado: {fmt(c.registeredAt)}</p>
            {c.stamps.at(-1) && <p className="text-xs text-gray-400">Último sello: {fmt(c.stamps.at(-1)!.timestamp)}</p>}
            <button
              type="button"
              onClick={() => remove(c.id)}
              className="mt-3 w-full text-red-500 border border-red-200 rounded-xl py-1.5 text-sm font-medium active:bg-red-50"
            >
              🗑 Eliminar cliente
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
