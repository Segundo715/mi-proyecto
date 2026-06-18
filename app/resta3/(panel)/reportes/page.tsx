'use client'

// Reportes de ventas e inventario de RESTA3. Datos calculados desde /api/orders y /api/resta3/inventory.
import { useState, useEffect } from 'react'
import Resta3Nav from '@/app/components/Resta3Nav'
import { Icon } from '@/app/components/Icon'

const S = { bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)', text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)' }

interface Order { id: string; customerName: string; status: string; total?: number; createdAt: string }
interface MenuItem { id: string; name: string; category: string; price: number; likes: number }
interface Review { id: string; customerName: string; rating: number; comment: string; createdAt: string }

export default function ReportesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [period, setPeriod] = useState<'hoy' | 'semana' | 'mes'>('hoy')

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/menu').then(r => r.json()),
      fetch('/api/reviews?all=1').then(r => r.json()),
    ]).then(([o, m, rv]) => {
      setOrders(Array.isArray(o) ? o : [])
      setMenu(Array.isArray(m) ? m : [])
      setReviews(Array.isArray(rv) ? rv : [])
    })
  }, [])

  function filterByPeriod(items: Order[]) {
    const now = new Date()
    return items.filter(o => {
      const d = new Date(o.createdAt)
      if (period === 'hoy') return d.toDateString() === now.toDateString()
      if (period === 'semana') return (now.getTime() - d.getTime()) < 7 * 86400000
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
  }

  const filtered = filterByPeriod(orders)
  const revenue = filtered.reduce((s, o) => s + (o.total ?? 0), 0)
  const delivered = filtered.filter(o => o.status === 'delivered').length
  const avgTicket = delivered > 0 ? revenue / delivered : 0
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const topMenu = [...menu].sort((a, b) => b.likes - a.likes).slice(0, 5)

  const byCategory = menu.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <Resta3Nav />
      <div className="max-w-[1100px] mx-auto p-4 space-y-5">

        <div className="flex items-center justify-between pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>Reportes y Estadísticas</h1>
          <div className="flex gap-1.5">
            {(['hoy', 'semana', 'mes'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
                style={period === p ? { background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' } : { backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { label: 'Ingresos', value: `$${revenue.toFixed(0)}`, color: S.accent, icon: 'cash' },
            { label: 'Órdenes', value: filtered.length, color: '#3b82f6', icon: 'receipt' },
            { label: 'Ticket Prom.', value: `$${avgTicket.toFixed(0)}`, color: '#a855f7', icon: 'chart' },
            { label: 'Rating Prom.', value: avgRating > 0 ? `${avgRating.toFixed(1)}` : '—', color: '#f472b6', icon: 'star' },
          ] as const).map(k => (
            <div key={k.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <div className="mb-1 flex justify-center" style={{ color: k.color }}><Icon name={k.icon} size={22} /></div>
              <p className="text-xl font-black" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs mt-0.5" style={{ color: S.sub }}>{k.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Top platillos */}
          <div className="rounded-2xl" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Platillos más gustados</span>
            </div>
            <div className="p-5 space-y-3">
              {topMenu.length === 0 ? (
                <p className="text-sm text-center" style={{ color: S.sub }}>Sin datos</p>
              ) : topMenu.map((item, i) => {
                const maxLikes = topMenu[0].likes || 1
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ backgroundColor: i === 0 ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.06)', color: i === 0 ? '#f59e0b' : S.sub }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: S.text }}>{item.name}</p>
                      <div className="h-1.5 rounded-full mt-1" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(item.likes / maxLikes) * 100}%`, backgroundColor: S.accent }} />
                      </div>
                    </div>
                    <span className="text-sm font-black shrink-0 inline-flex items-center gap-1" style={{ color: S.accent }}><Icon name="heart" size={13} /> {item.likes}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Por categoría */}
          <div className="rounded-2xl" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Carta por categoría</span>
            </div>
            <div className="p-5 space-y-3">
              {Object.entries(byCategory).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: S.text }}>{cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(count / menu.length) * 100}%`, backgroundColor: '#3b82f6' }} />
                    </div>
                    <span className="text-sm font-black" style={{ color: '#3b82f6' }}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reseñas recientes */}
          <div className="md:col-span-2 rounded-2xl" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Últimas reseñas</span>
            </div>
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: S.sub }}>Sin reseñas aún</div>
            ) : (
              <div className="divide-y" style={{ borderColor: S.border }}>
                {reviews.slice(0, 5).map(r => (
                  <div key={r.id} className="px-5 py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                      style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }}>
                      {r.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold" style={{ color: S.text }}>{r.customerName}</p>
                        <span className="inline-flex items-center gap-0.5" style={{ color: '#fbbf24' }}>{Array.from({ length: r.rating }).map((_, s) => <Icon key={s} name="star" size={11} />)}</span>
                      </div>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: S.sub }}>{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
