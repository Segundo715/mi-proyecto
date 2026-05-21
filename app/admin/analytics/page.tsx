'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/app/components/AdminNav'

interface AnalyticsData {
  loyaltyCards: { active: number; totalStamps: number; totalRedeemed: number }
  customers: { total: number }
  orders: { total: number; delivered: number; pending: number }
  revenue: { total: number; avgOrderValue: number }
  reviews: { total: number; avgRating: number; published: number; bad: number }
  topItems: { name: string; count: number; revenue: number }[]
  ordersPerDay: { day: string; orders: number; revenue: number }[]
}

function StatCard({ emoji, label, value, sub }: { emoji: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{emoji}</span>
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const maxOrders = data ? Math.max(...data.ordersPerDay.map(d => d.orders), 1) : 1

  return (
    <div className="min-h-screen bg-stone-100">
      <AdminNav />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-xl font-black text-gray-900 pt-2">📊 Analytics</h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !data ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
            <p className="text-4xl mb-2">📊</p>
            <p>No se pudo cargar el analytics</p>
          </div>
        ) : (
          <>
            {/* Loyalty cards — destacado */}
            <div className="rounded-3xl overflow-hidden shadow-lg"
              style={{ background: 'linear-gradient(135deg, #431c0d 0%, #7c2d12 50%, #92400e 100%)' }}>
              <div className="px-5 pt-5 pb-4">
                <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">Tarjetas de lealtad</p>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-white text-5xl font-black leading-none">{data.loyaltyCards.active}</p>
                    <p className="text-amber-400 text-sm mt-1">tarjetas activas</p>
                  </div>
                  <div className="flex-1 text-right pb-1">
                    <p className="text-amber-300 text-2xl font-black">{data.loyaltyCards.totalStamps}</p>
                    <p className="text-amber-500 text-xs">sellos totales</p>
                  </div>
                </div>
              </div>
              <div className="flex border-t border-amber-800">
                <div className="flex-1 px-4 py-3 text-center border-r border-amber-800">
                  <p className="text-white font-black text-xl">{data.loyaltyCards.totalRedeemed}</p>
                  <p className="text-amber-400 text-xs">cafés canjeados</p>
                </div>
                <div className="flex-1 px-4 py-3 text-center">
                  <p className="text-white font-black text-xl">{data.customers.total}</p>
                  <p className="text-amber-400 text-xs">clientes</p>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Ingresos</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  emoji="💰"
                  label="Total ingresos"
                  value={`$${data.revenue.total.toFixed(2)}`}
                  sub="de pedidos entregados"
                />
                <StatCard
                  emoji="🧾"
                  label="Ticket promedio"
                  value={`$${data.revenue.avgOrderValue.toFixed(2)}`}
                  sub="por pedido"
                />
              </div>
            </section>

            {/* Orders */}
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Pedidos</h2>
              <div className="grid grid-cols-3 gap-3">
                <StatCard emoji="📋" label="Total" value={data.orders.total} />
                <StatCard emoji="✅" label="Entregados" value={data.orders.delivered} />
                <StatCard emoji="⏳" label="Pendientes" value={data.orders.pending} />
              </div>
            </section>

            {/* Orders chart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Pedidos últimos 7 días</p>
              <div className="flex items-end gap-1.5 h-24">
                {data.ordersPerDay.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500 font-medium">{d.orders || ''}</span>
                    <div className="w-full rounded-t-md bg-amber-400 transition-all"
                      style={{ height: `${(d.orders / maxOrders) * 72}px`, minHeight: d.orders ? 4 : 0 }} />
                    <span className="text-[9px] text-gray-400 text-center leading-tight"
                      style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {d.day.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customers */}
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Clientes</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard emoji="👥" label="Clientes" value={data.customers.total} sub="iniciaron sesión" />
                <StatCard emoji="☕" label="Sellos dados" value={data.loyaltyCards.totalStamps} sub="visitas acumuladas" />
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Reseñas</h2>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <p className="text-3xl font-black text-gray-900">{data.reviews.avgRating.toFixed(1)}</p>
                    <Stars rating={data.reviews.avgRating} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>✅ Publicadas</span><span>{data.reviews.published}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>⚠️ Malas</span><span>{data.reviews.bad}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>📝 Total</span><span>{data.reviews.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Top items */}
            {data.topItems.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Top productos</h2>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {data.topItems.map((item, i) => (
                    <div key={item.name}
                      className={`flex items-center px-4 py-3 gap-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                      <span className="text-lg font-black text-amber-600 w-5 text-center">{i + 1}</span>
                      <span className="flex-1 font-semibold text-gray-800 text-sm">{item.name}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{item.count} vendidos</p>
                        <p className="text-xs text-gray-400">${item.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
