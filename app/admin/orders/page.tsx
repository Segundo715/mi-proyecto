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

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: '🕐 Pendiente',
  preparing: '🍳 Preparando',
  ready: '✅ Listo',
  delivered: '📦 Entregado',
}

const STATUS_NEXT: Partial<Record<Order['status'], Order['status']>> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
}

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-red-100 text-red-700 border-red-200',
  preparing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ready: 'bg-green-100 text-green-700 border-green-200',
  delivered: 'bg-gray-100 text-gray-500 border-gray-200',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'active' | 'chart'>('active')

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
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    load()
  }

  const active = orders.filter(o => o.status !== 'delivered')
  const delivered = orders.filter(o => o.status === 'delivered')

  // Chart data: count items across ALL orders
  const itemCounts: Record<string, number> = {}
  for (const order of orders) {
    for (const item of order.items) {
      itemCounts[item.name] = (itemCounts[item.name] ?? 0) + item.quantity
    }
  }
  const chartData = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const maxCount = chartData[0]?.[1] ?? 1

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 sticky top-[52px] z-10">
        <div className="max-w-2xl mx-auto px-4 flex">
          {(['active', 'chart'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t ? 'border-amber-700 text-amber-800' : 'border-transparent text-gray-400'
              }`}
            >
              {t === 'active' ? `Pedidos activos (${active.length})` : '📊 Lo más consumido'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* ── TAB: PEDIDOS ACTIVOS ── */}
        {tab === 'active' && (
          <>
            {loading && <div className="text-center py-10 text-amber-700">Cargando...</div>}

            {!loading && active.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-3">🍽</p>
                <p className="font-medium">No hay pedidos activos</p>
              </div>
            )}

            {active.map(order => (
              <div key={order.id} className={`bg-white rounded-2xl shadow border ${STATUS_COLORS[order.status]} border-l-4 p-4 space-y-3`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900 text-base">{order.customerName}</p>
                    {order.tableNumber && (
                      <p className="text-sm text-gray-500">Mesa {order.tableNumber}</p>
                    )}
                    <p className="text-xs text-gray-400">{fmt(order.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                <ul className="space-y-1">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm text-gray-700">
                      <span>{item.quantity}× {item.name}</span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                {order.notes && (
                  <p className="text-xs bg-amber-50 text-amber-800 rounded-lg px-3 py-2">
                    📝 {order.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-gray-900">${order.total.toFixed(2)}</span>
                  {STATUS_NEXT[order.status] && (
                    <button
                      type="button"
                      onClick={() => advance(order.id, STATUS_NEXT[order.status]!)}
                      className="bg-amber-700 active:bg-amber-900 text-white text-sm font-bold px-4 py-2 rounded-xl"
                    >
                      → {STATUS_LABELS[STATUS_NEXT[order.status]!]}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {delivered.length > 0 && (
              <details className="mt-2">
                <summary className="text-sm text-gray-400 cursor-pointer py-2">
                  Ver entregados ({delivered.length})
                </summary>
                <div className="space-y-3 mt-2">
                  {delivered.slice(0, 10).map(order => (
                    <div key={order.id} className="bg-white rounded-2xl shadow p-4 opacity-60">
                      <div className="flex justify-between">
                        <p className="font-semibold text-gray-700">{order.customerName}</p>
                        <p className="text-xs text-gray-400">{fmt(order.createdAt)}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                      </p>
                      <p className="text-sm font-bold text-gray-700 mt-1">${order.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}

        {/* ── TAB: GRÁFICA ── */}
        {tab === 'chart' && (
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="font-bold text-amber-900 text-lg mb-1">Lo más consumido</h2>
            <p className="text-xs text-gray-400 mb-5">
              Basado en {orders.length} pedido{orders.length !== 1 ? 's' : ''}
            </p>

            {chartData.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">📊</p>
                <p>Aún no hay datos suficientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chartData.map(([name, count]) => (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800 truncate max-w-[70%]">{name}</span>
                      <span className="font-bold text-amber-700 ml-2">{count}</span>
                    </div>
                    <div className="h-5 bg-amber-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full transition-all"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
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
