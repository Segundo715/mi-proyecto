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

const S = {
  bg:     '#080b16',
  card:   '#0e1225',
  accent: '#00e676',
  text:   '#eef2f7',
  sub:    '#6b7a94',
  border: 'rgba(255,255,255,0.07)',
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
      <span className="text-xs font-medium uppercase tracking-wide block mb-1" style={{ color: S.sub }}>{label}</span>
      <p className="text-2xl font-black" style={{ color: S.text }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: S.sub }}>{sub}</p>}
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">
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
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <AdminNav />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-xl font-black pt-2" style={{ color: S.text }}>Dashboard</h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: S.card }} />
            ))}
          </div>
        ) : !data ? (
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <p className="text-4xl mb-2">📊</p>
            <p style={{ color: S.sub }}>No se pudo cargar el analytics</p>
          </div>
        ) : (
          <>
            {/* Loyalty cards — destacado */}
            <div className="rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#071a10,#0a2518,#071a10)', border: '1px solid rgba(0,230,118,0.2)' }}>
              <div className="px-5 pt-5 pb-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: S.accent }}>Tarjetas de lealtad</p>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-5xl font-black leading-none" style={{ color: S.text }}>{data.loyaltyCards.active}</p>
                    <p className="text-sm mt-1" style={{ color: S.accent }}>tarjetas activas</p>
                  </div>
                  <div className="flex-1 text-right pb-1">
                    <p className="text-2xl font-black" style={{ color: S.text }}>{data.loyaltyCards.totalStamps}</p>
                    <p className="text-xs" style={{ color: S.sub }}>sellos totales</p>
                  </div>
                </div>
              </div>
              <div className="flex" style={{ borderTop: '1px solid rgba(0,230,118,0.15)' }}>
                <div className="flex-1 px-4 py-3 text-center" style={{ borderRight: '1px solid rgba(0,230,118,0.15)' }}>
                  <p className="font-black text-xl" style={{ color: S.text }}>{data.loyaltyCards.totalRedeemed}</p>
                  <p className="text-xs" style={{ color: S.sub }}>cafés canjeados</p>
                </div>
                <div className="flex-1 px-4 py-3 text-center">
                  <p className="font-black text-xl" style={{ color: S.text }}>{data.customers.total}</p>
                  <p className="text-xs" style={{ color: S.sub }}>clientes</p>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: S.sub }}>Ingresos</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total ingresos" value={`$${data.revenue.total.toFixed(2)}`} sub="de pedidos entregados" />
                <StatCard label="Ticket promedio" value={`$${data.revenue.avgOrderValue.toFixed(2)}`} sub="por pedido" />
              </div>
            </section>

            {/* Orders */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: S.sub }}>Pedidos</h2>
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Total" value={data.orders.total} />
                <StatCard label="Entregados" value={data.orders.delivered} />
                <StatCard label="Pendientes" value={data.orders.pending} />
              </div>
            </section>

            {/* Orders chart */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: S.sub }}>Pedidos últimos 7 días</p>
              <div className="flex items-end gap-1.5 h-24">
                {data.ordersPerDay.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium" style={{ color: S.sub }}>{d.orders || ''}</span>
                    <div className="w-full rounded-t-md transition-all"
                      style={{ backgroundColor: S.accent, height: `${(d.orders / maxOrders) * 72}px`, minHeight: d.orders ? 4 : 0, opacity: 0.85 }} />
                    <span className="text-[9px] text-center leading-tight"
                      style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: S.sub }}>
                      {d.day.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customers */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: S.sub }}>Clientes</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Clientes" value={data.customers.total} sub="iniciaron sesión" />
                <StatCard label="Sellos dados" value={data.loyaltyCards.totalStamps} sub="visitas acumuladas" />
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: S.sub }}>Reseñas</h2>
              <div className="rounded-2xl p-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <p className="text-3xl font-black" style={{ color: S.text }}>{data.reviews.avgRating.toFixed(1)}</p>
                    <Stars rating={data.reviews.avgRating} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs" style={{ color: S.sub }}>
                      <span>✅ Publicadas</span><span>{data.reviews.published}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: S.sub }}>
                      <span>⚠️ Malas</span><span>{data.reviews.bad}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: S.sub }}>
                      <span>📝 Total</span><span>{data.reviews.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Top items */}
            {data.topItems.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: S.sub }}>Top productos</h2>
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                  {data.topItems.map((item, i) => (
                    <div key={item.name}
                      className="flex items-center px-4 py-3 gap-3"
                      style={{ borderTop: i > 0 ? `1px solid ${S.border}` : 'none' }}>
                      <span className="font-black w-5 text-center text-sm" style={{ color: S.accent }}>{i + 1}</span>
                      <span className="flex-1 font-semibold text-sm" style={{ color: S.text }}>{item.name}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: S.text }}>{item.count} vendidos</p>
                        <p className="text-xs" style={{ color: S.sub }}>${item.revenue.toFixed(2)}</p>
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
