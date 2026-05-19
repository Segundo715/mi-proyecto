'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

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

const STATUS_CONFIG: Record<Order['status'], {
  label: string; headerBg: string; cardBorder: string; badge: string; step: number
}> = {
  pending:   { label: 'Pendiente',  headerBg: 'bg-red-500',    cardBorder: 'border-red-300',    badge: 'bg-red-100 text-red-700 border-red-200',       step: 0 },
  preparing: { label: 'Preparando', headerBg: 'bg-amber-500',  cardBorder: 'border-amber-300',  badge: 'bg-amber-100 text-amber-800 border-amber-200', step: 1 },
  ready:     { label: 'Listo',      headerBg: 'bg-green-500',  cardBorder: 'border-green-300',  badge: 'bg-green-100 text-green-700 border-green-200', step: 2 },
  delivered: { label: 'Entregado',  headerBg: 'bg-gray-400',   cardBorder: 'border-gray-200',   badge: 'bg-gray-100 text-gray-500 border-gray-200',    step: 3 },
}

const NEXT_ACTION: Partial<Record<Order['status'], { label: string; btn: string }>> = {
  pending:   { label: 'Iniciar preparación', btn: 'bg-amber-500 active:bg-amber-600 text-white' },
  preparing: { label: 'Marcar como listo',   btn: 'bg-green-500 active:bg-green-600 text-white' },
  ready:     { label: 'Confirmar entrega',   btn: 'bg-gray-600 active:bg-gray-700 text-white'   },
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'active' | 'chart'>('active')
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

  const itemCounts: Record<string, number> = {}
  for (const order of orders)
    for (const item of order.items)
      itemCounts[item.name] = (itemCounts[item.name] ?? 0) + item.quantity
  const chartData = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxCount = chartData[0]?.[1] ?? 1

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />

      {/* Sub-tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[52px] z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 flex">
          {(['active', 'chart'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`px-5 py-3.5 text-sm font-bold border-b-2 transition-colors ${
                tab === t ? 'border-amber-700 text-amber-800' : 'border-transparent text-gray-400'
              }`}
            >
              {t === 'active'
                ? <>Pedidos activos {active.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{active.length}</span>}</>
                : '📊 Lo más consumido'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* ── PEDIDOS ACTIVOS ── */}
        {tab === 'active' && (
          <>
            {loading && (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white rounded-2xl shadow overflow-hidden animate-pulse">
                    <div className="h-12 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded-full w-2/3" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                      <div className="h-10 bg-gray-100 rounded-xl mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && active.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-6xl mb-4">🍽</p>
                <p className="font-semibold text-lg">No hay pedidos activos</p>
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
                <div key={order.id}
                  className={`bg-white rounded-2xl shadow-md overflow-hidden border ${cfg.cardBorder} ${
                    order.status === 'pending' ? 'ring-2 ring-red-400 ring-offset-1' : ''
                  }`}
                >
                  {/* Status header */}
                  <div className={`${cfg.headerBg} px-4 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && <span className="text-white text-lg animate-bounce">🔔</span>}
                      {order.status === 'preparing' && <span className="text-white text-lg">🍳</span>}
                      {order.status === 'ready' && <span className="text-white text-lg">✅</span>}
                      <span className="text-white font-black text-sm uppercase tracking-wide">{cfg.label}</span>
                      {nuevo && (
                        <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">NUEVO</span>
                      )}
                    </div>
                    <span className="text-white/80 text-xs font-medium">{timeAgo(order.createdAt)}</span>
                  </div>

                  {/* Step progress */}
                  <div className="px-4 pt-3 flex items-center gap-1">
                    {STEPS.map((step, i) => (
                      <div key={step} className="flex items-center flex-1">
                        <div className={`h-1.5 rounded-full flex-1 transition-all ${
                          i <= cfg.step ? cfg.headerBg : 'bg-gray-100'
                        }`} />
                        {i < STEPS.length - 1 && <div className="w-1" />}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Customer info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-black text-gray-900 text-lg leading-tight">{order.customerName}</p>
                        {order.tableNumber && (
                          <p className="text-sm text-gray-500 font-medium">Mesa {order.tableNumber}</p>
                        )}
                      </div>
                      <span className="font-black text-xl text-gray-900">${order.total.toFixed(2)}</span>
                    </div>

                    {/* Items */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-800 font-medium">
                            <span className="font-black text-amber-700">{item.quantity}×</span> {item.name}
                          </span>
                          <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        <span className="text-amber-600 text-sm">📝</span>
                        <p className="text-sm text-amber-800 font-medium">{order.notes}</p>
                      </div>
                    )}

                    {/* Action button */}
                    {nextStatus && nextAction && (
                      <button
                        type="button"
                        onClick={() => advance(order.id, nextStatus)}
                        disabled={isAdvancing}
                        className={`w-full py-3.5 rounded-xl font-black text-sm transition-all disabled:opacity-60 ${nextAction.btn}`}
                      >
                        {isAdvancing ? 'Actualizando...' : `${nextAction.label} →`}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {delivered.length > 0 && (
              <details className="group">
                <summary className="text-sm text-gray-400 cursor-pointer py-2 px-1 flex items-center gap-2 select-none">
                  <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                  Entregados ({delivered.length})
                </summary>
                <div className="space-y-2 mt-2">
                  {delivered.slice(0, 10).map(order => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm p-3 opacity-60 flex items-center gap-3">
                      <span className="text-2xl">📦</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-700 text-sm">{order.customerName}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-600">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">{timeAgo(order.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}

        {/* ── GRÁFICA ── */}
        {tab === 'chart' && (
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="font-black text-amber-900 text-xl mb-1">Lo más consumido</h2>
            <p className="text-xs text-gray-400 mb-6">
              Basado en {orders.length} pedido{orders.length !== 1 ? 's' : ''}
            </p>

            {chartData.length === 0 ? (
              <div className="text-center py-14 text-gray-400">
                <p className="text-5xl mb-3">📊</p>
                <p className="font-medium">Aún no hay datos suficientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chartData.map(([name, count], idx) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-amber-300 text-amber-900' : 'bg-gray-100 text-gray-500'
                    }`}>{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold text-gray-800 truncate">{name}</span>
                        <span className="font-black text-amber-700 ml-2 shrink-0">{count}</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
