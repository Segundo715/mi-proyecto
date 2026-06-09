'use client'

// KDS de cocina: auto-refresca cada 10 s vía setInterval, AudioContext alerta cuando llega
// pedido nuevo, badge de urgencia cuando el pedido supera el umbral de tiempo configurado.
import { useState, useEffect, useRef } from 'react'
import Resta3Nav from '@/app/components/Resta3Nav'

const S = { bg: '#0a0d14', card: '#1a1d27', accent: '#f59e0b', text: '#f1f5f9', sub: '#64748b', border: 'rgba(245,158,11,0.1)' }

interface OrderItem { name: string; quantity: number; price: number }
interface Order { id: string; customerName: string; tableNumber?: string; status: string; items: OrderItem[]; notes?: string; createdAt: string }

const STATUS_CFG: Record<string, { label: string; color: string; next: string; nextLabel: string; urgentAfter: number }> = {
  pending:   { label: 'Nuevo',       color: '#f59e0b', next: 'preparing', nextLabel: '▶ Iniciar',      urgentAfter: 5 },
  preparing: { label: 'Preparando',  color: '#3b82f6', next: 'ready',     nextLabel: '✓ Listo',        urgentAfter: 15 },
  ready:     { label: 'Listo',       color: '#22c55e', next: 'delivered', nextLabel: '🚀 Entregar',    urgentAfter: 10 },
}

function elapsed(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return { label: 'ahora', mins: 0 }
  return { label: `${mins} min`, mins }
}

export default function CocinaPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState<string | null>(null)
  const [lastCount, setLastCount] = useState(0)
  const [newAlert, setNewAlert] = useState(false)
  const audioRef = useRef<AudioContext | null>(null)

  async function load(silent = false) {
    const r = await fetch('/api/orders')
    if (!r.ok) return
    const data: Order[] = await r.json()
    const active = data.filter(o => o.status !== 'delivered')
    if (!silent && active.length > lastCount && lastCount > 0) {
      setNewAlert(true)
      playBeep()
      setTimeout(() => setNewAlert(false), 4000)
    }
    setLastCount(active.length)
    setOrders(active)
    setLoading(false)
  }

  function playBeep() {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext()
      const ctx = audioRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = 880; gain.gain.value = 0.3
      osc.start(); osc.stop(ctx.currentTime + 0.2)
    } catch {}
  }

  useEffect(() => {
    load(true)
    const t = setInterval(() => load(), 10000)
    return () => clearInterval(t)
  }, [])

  async function advance(id: string, next: string) {
    setAdvancing(id)
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    await load(true)
    setAdvancing(null)
  }

  const groups = ['pending', 'preparing', 'ready']
  const totalActive = orders.length

  return (
    <div className="min-h-screen md:ml-[220px]" style={{ backgroundColor: S.bg }}>
      <Resta3Nav />

      {/* Alerta nuevo pedido */}
      {newAlert && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl font-black text-sm animate-bounce"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }}>
          🔔 ¡Nuevo pedido!
        </div>
      )}

      <div className="max-w-[1200px] mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-black" style={{ color: S.text }}>Cocina — KDS</h1>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>
              {totalActive} pedido{totalActive !== 1 ? 's' : ''} activo{totalActive !== 1 ? 's' : ''} · Actualiza cada 10s
            </p>
          </div>
          <button onClick={() => load(true)}
            className="text-xs px-3 py-1.5 rounded-lg font-bold"
            style={{ backgroundColor: S.card, color: S.accent, border: `1px solid ${S.border}` }}>
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
              const cfg = STATUS_CFG[status]
              const groupOrders = orders.filter(o => o.status === status)
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-sm font-black" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>{groupOrders.length}</span>
                  </div>

                  <div className="space-y-3">
                    {groupOrders.length === 0 ? (
                      <div className="rounded-2xl p-6 text-center text-sm"
                        style={{ backgroundColor: S.card, border: `1px solid ${S.border}`, color: S.sub }}>
                        Sin pedidos
                      </div>
                    ) : groupOrders.map(order => {
                      const { label: elLabel, mins } = elapsed(order.createdAt)
                      const urgent = mins >= cfg.urgentAfter
                      return (
                        <div key={order.id} className="rounded-2xl p-4 space-y-3 transition-all"
                          style={{ backgroundColor: S.card, border: `2px solid ${urgent ? cfg.color + '66' : cfg.color + '22'}` }}>

                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-black text-sm" style={{ color: S.text }}>{order.customerName}</p>
                              {order.tableNumber && <p className="text-xs" style={{ color: S.sub }}>{order.tableNumber}</p>}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-black px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: urgent ? `${cfg.color}30` : `${cfg.color}15`, color: cfg.color }}>
                                {urgent ? '⚠ ' : ''}{elLabel}
                              </span>
                            </div>
                          </div>

                          {/* Items */}
                          {order.items.length > 0 && (
                            <ul className="space-y-1">
                              {order.items.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm" style={{ color: S.text }}>
                                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                                    style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>{item.quantity}</span>
                                  {item.name}
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Notas */}
                          {order.notes && (() => {
                            const note = order.notes.replace(/\[\w+\]\s?/, '')
                            return note ? (
                              <p className="text-xs px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#0f1117', color: '#fbbf24' }}>
                                📝 {note}
                              </p>
                            ) : null
                          })()}

                          {/* Acción */}
                          <button onClick={() => advance(order.id, cfg.next)} disabled={advancing === order.id}
                            className="w-full py-2.5 rounded-xl text-sm font-black transition-all disabled:opacity-60"
                            style={{ background: `linear-gradient(135deg,${cfg.color}22,${cfg.color}11)`, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
                            {advancing === order.id ? 'Guardando...' : cfg.nextLabel}
                          </button>
                        </div>
                      )
                    })}
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
