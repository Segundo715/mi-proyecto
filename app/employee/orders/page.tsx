'use client'

// Gestión de pedidos para el empleado: polling cada 10 s, avanza estado igual que admin/orders.
import { useState, useEffect } from 'react'
import EmployeeNav from '@/app/components/EmployeeNav'

interface OrderItem { name: string; quantity: number; price: number }
interface Order {
  id: string
  customerName: string
  tableNumber?: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered'
  createdAt: string
  notes?: string
}

const S = {
  bg:     'var(--ad-bg)',
  card:   'var(--ad-card)',
  accent: 'var(--ad-accent)',
  text:   'var(--ad-text)',
  sub:    'var(--ad-sub)',
  border: 'var(--ad-border)',
}

const STATUS_CONFIG: Record<Order['status'], { label: string; headerBg: string; cardBorderColor: string; step: number }> = {
  pending:   { label: 'Pendiente',  headerBg: '#ef4444', cardBorderColor: 'rgba(239,68,68,0.5)',   step: 0 },
  preparing: { label: 'Preparando', headerBg: '#f59e0b', cardBorderColor: 'rgba(245,158,11,0.5)', step: 1 },
  ready:     { label: 'Listo',      headerBg: '#22c55e', cardBorderColor: 'rgba(34,197,94,0.5)',  step: 2 },
  delivered: { label: 'Entregado',  headerBg: '#6b7280', cardBorderColor: S.border,               step: 3 },
}

const NEXT_ACTION: Partial<Record<Order['status'], { label: string; btnBg: string; btnColor: string }>> = {
  pending:   { label: 'Iniciar preparación', btnBg: '#f59e0b', btnColor: '#000' },
  preparing: { label: 'Marcar como listo',   btnBg: '#22c55e', btnColor: '#000' },
  ready:     { label: 'Confirmar entrega',   btnBg: '#6b7280', btnColor: '#fff' },
}

const NEXT_STATUS: Partial<Record<Order['status'], Order['status']>> = {
  pending: 'preparing', preparing: 'ready', ready: 'delivered',
}

const STEPS = ['Recibido', 'Preparando', 'Listo', 'Entregado']

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 90) return 'hace un momento'
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  return `hace ${Math.floor(s / 3600)} h`
}

function isNew(iso: string) {
  return Date.now() - new Date(iso).getTime() < 2 * 60 * 1000
}

export default function EmployeeOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState<string | null>(null)

  useEffect(() => {
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [])

  async function load() {
    const res = await fetch('/api/orders')
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }

  async function advance(id: string, next: Order['status']) {
    setAdvancing(id)
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    await load()
    setAdvancing(null)
  }

  const active = orders.filter(o => o.status !== 'delivered')
  const delivered = orders.filter(o => o.status === 'delivered')

  return (
    <div className="min-h-screen md:ml-[240px] md:pt-16" style={{ backgroundColor: S.bg }}>
      <EmployeeNav />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>
            Pedidos activos
            {active.length > 0 && (
              <span className="ml-2 text-sm font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#ef4444', color: '#fff' }}>{active.length}</span>
            )}
          </h1>
          <button type="button" onClick={load}
            className="text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ backgroundColor: 'var(--ad-overlay)', color: S.accent, border: `1px solid ${S.border}` }}>
            ↻ Actualizar
          </button>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: S.card }}>
                <div className="h-12" style={{ backgroundColor: 'var(--ad-overlay)' }} />
                <div className="p-4 space-y-3">
                  <div className="h-4 rounded-full w-2/3" style={{ backgroundColor: 'var(--ad-overlay)' }} />
                  <div className="h-10 rounded-xl mt-4" style={{ backgroundColor: 'var(--ad-overlay)' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && active.length === 0 && (
          <div className="text-center py-20" style={{ color: S.sub }}>
            <p className="text-6xl mb-4">🍽</p>
            <p className="font-semibold text-lg" style={{ color: S.text }}>No hay pedidos activos</p>
            <p className="text-sm mt-1">Los nuevos pedidos aparecerán aquí</p>
          </div>
        )}

        {active.map(order => {
          const cfg = STATUS_CONFIG[order.status]
          const nextStatus = NEXT_STATUS[order.status]
          const nextAction = NEXT_ACTION[order.status]
          const isAdvancing = advancing === order.id
          const nuevo = isNew(order.createdAt)

          return (
            <div key={order.id} className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: S.card,
                border: `1px solid ${cfg.cardBorderColor}`,
                boxShadow: order.status === 'pending' ? '0 0 0 2px rgba(239,68,68,0.35)' : 'none',
              }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: cfg.headerBg }}>
                <div className="flex items-center gap-2">
                  {order.status === 'pending' && <span className="text-white text-lg animate-bounce">🔔</span>}
                  {order.status === 'preparing' && <span className="text-white text-lg">🍳</span>}
                  {order.status === 'ready' && <span className="text-white text-lg">✅</span>}
                  <span className="text-white font-black text-sm uppercase tracking-wide">{cfg.label}</span>
                  {nuevo && <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">NUEVO</span>}
                </div>
                <span className="text-white/80 text-xs font-medium">{timeAgo(order.createdAt)}</span>
              </div>

              <div className="px-4 pt-3 flex items-center gap-1">
                {STEPS.map((_, i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className="h-1.5 rounded-full flex-1 transition-all"
                      style={{ backgroundColor: i <= cfg.step ? cfg.headerBg : 'rgba(255,255,255,0.1)' }} />
                    {i < STEPS.length - 1 && <div className="w-1" />}
                  </div>
                ))}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-black text-lg leading-tight" style={{ color: S.text }}>{order.customerName}</p>
                    {order.tableNumber && <p className="text-sm font-medium" style={{ color: S.sub }}>Mesa {order.tableNumber}</p>}
                  </div>
                  <span className="font-black text-xl" style={{ color: S.text }}>${order.total.toFixed(2)}</span>
                </div>

                <div className="rounded-xl p-3 space-y-1.5"
                  style={{ backgroundColor: 'var(--ad-overlay)', border: `1px solid ${S.border}` }}>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span style={{ color: S.text }}>
                        <span className="font-black" style={{ color: S.accent }}>{item.quantity}×</span> {item.name}
                      </span>
                      <span style={{ color: S.sub }}>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="flex items-start gap-2 rounded-xl px-3 py-2"
                    style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <span className="text-yellow-400 text-sm">📝</span>
                    <p className="text-sm font-medium" style={{ color: '#fde68a' }}>{order.notes}</p>
                  </div>
                )}

                {nextStatus && nextAction && (
                  <button type="button" onClick={() => advance(order.id, nextStatus)} disabled={isAdvancing}
                    className="w-full py-3.5 rounded-xl font-black text-sm transition-all disabled:opacity-60"
                    style={{ backgroundColor: nextAction.btnBg, color: nextAction.btnColor }}>
                    {isAdvancing ? 'Actualizando...' : `${nextAction.label} →`}
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {delivered.length > 0 && (
          <details className="group">
            <summary className="text-sm cursor-pointer py-2 px-1 flex items-center gap-2 select-none" style={{ color: S.sub }}>
              <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
              Entregados ({delivered.length})
            </summary>
            <div className="space-y-2 mt-2">
              {delivered.slice(0, 10).map(order => (
                <div key={order.id} className="rounded-xl p-3 flex items-center gap-3 opacity-50"
                  style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                  <span className="text-2xl">📦</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: S.text }}>{order.customerName}</p>
                    <p className="text-xs truncate" style={{ color: S.sub }}>
                      {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: S.text }}>${order.total.toFixed(2)}</p>
                    <p className="text-xs" style={{ color: S.sub }}>{timeAgo(order.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
