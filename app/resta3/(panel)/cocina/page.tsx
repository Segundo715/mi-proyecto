'use client'

import { useState, useEffect } from 'react'
import Resta3Nav from '@/app/components/Resta3Nav'

const S = { bg: '#0a0d14', card: '#1a1d27', accent: '#f59e0b', text: '#f1f5f9', sub: '#64748b', border: 'rgba(245,158,11,0.1)' }

interface Order { id: string; customerName: string; status: string; items?: { name: string; qty: number }[]; createdAt: string }

function elapsed(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'ahora'
  return `${mins} min`
}

const STATUS_CONFIG: Record<string, { label: string; color: string; next: string; nextLabel: string }> = {
  pending:   { label: 'Pendiente',    color: '#f59e0b', next: 'preparing', nextLabel: 'Iniciar' },
  preparing: { label: 'En preparación', color: '#3b82f6', next: 'ready', nextLabel: 'Listo ✓' },
  ready:     { label: 'Listo',        color: '#22c55e', next: 'delivered', nextLabel: 'Entregar' },
}

export default function CocinaPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const r = await fetch('/api/orders')
    const data = await r.json()
    setOrders(Array.isArray(data) ? data.filter((o: Order) => o.status !== 'delivered') : [])
    setLoading(false)
  }

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t) }, [])

  async function advance(id: string, next: string) {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
    load()
  }

  const groups = ['pending', 'preparing', 'ready']

  return (
    <div className="min-h-screen md:ml-[220px]" style={{ backgroundColor: S.bg }}>
      <Resta3Nav />
      <div className="max-w-[1200px] mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>Cocina — KDS</h1>
          <button onClick={load} className="text-xs px-3 py-1.5 rounded-lg font-bold" style={{ backgroundColor: S.card, color: S.accent, border: `1px solid ${S.border}` }}>
            ↻ Actualizar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm" style={{ color: S.sub }}>Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <p className="text-5xl mb-3">✅</p>
            <p className="text-lg font-black" style={{ color: S.text }}>Cocina al día</p>
            <p className="text-sm mt-1" style={{ color: S.sub }}>Sin pedidos pendientes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groups.map(status => {
              const cfg = STATUS_CONFIG[status]
              const groupOrders = orders.filter(o => o.status === status)
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-sm font-black" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>{groupOrders.length}</span>
                  </div>

                  <div className="space-y-3">
                    {groupOrders.length === 0 ? (
                      <div className="rounded-2xl p-6 text-center text-sm" style={{ backgroundColor: S.card, border: `1px solid ${S.border}`, color: S.sub }}>
                        Sin pedidos
                      </div>
                    ) : groupOrders.map(order => (
                      <div key={order.id} className="rounded-2xl p-4 space-y-3"
                        style={{ backgroundColor: S.card, border: `1px solid ${cfg.color}33` }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-black text-sm" style={{ color: S.text }}>{order.customerName}</p>
                            <p className="text-xs" style={{ color: S.sub }}>{elapsed(order.createdAt)}</p>
                          </div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>
                            {elapsed(order.createdAt)}
                          </span>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <ul className="space-y-1">
                            {order.items.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm" style={{ color: S.text }}>
                                <span className="w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black"
                                  style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>{item.qty}</span>
                                {item.name}
                              </li>
                            ))}
                          </ul>
                        )}

                        <button onClick={() => advance(order.id, cfg.next)}
                          className="w-full py-2.5 rounded-xl text-sm font-black transition-all"
                          style={{ background: `linear-gradient(135deg,${cfg.color}22,${cfg.color}11)`, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
                          {cfg.nextLabel}
                        </button>
                      </div>
                    ))}
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
