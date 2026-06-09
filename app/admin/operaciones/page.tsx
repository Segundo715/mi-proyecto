'use client'

// Vista de mesas y pedidos con KDS. Datos demo; pedidos reales con persistencia están en /admin/orders.
import { useState } from 'react'
import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)',
  text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)',
}

const SALON = [
  { num: '1',  status: 'free',     time: '—'  },
  { num: '2',  status: 'occupied', time: "25'" },
  { num: '3',  status: 'billing',  time: "42'" },
  { num: '4',  status: 'occupied', time: "8'"  },
  { num: '5',  status: 'free',     time: '—'  },
  { num: '6',  status: 'occupied', time: "55'" },
  { num: '7',  status: 'occupied', time: "15'" },
  { num: '8',  status: 'free',     time: '—'  },
  { num: '9',  status: 'free',     time: '—'  },
  { num: '10', status: 'occupied', time: "33'" },
]
const TERRAZA = [
  { num: 'T1', status: 'free',     time: '—'  },
  { num: 'T2', status: 'occupied', time: "14'" },
  { num: 'T3', status: 'free',     time: '—'  },
  { num: 'T4', status: 'billing',  time: "40'" },
  { num: 'T5', status: 'free',     time: '—'  },
  { num: 'T6', status: 'occupied', time: "22'" },
]

const TABLE_STYLE: Record<string, { border: string; textColor: string; bg: string }> = {
  free:     { border: 'rgba(0,230,118,.3)',  textColor: 'var(--ad-accent)', bg: 'rgba(0,230,118,.05)'  },
  occupied: { border: 'rgba(239,68,68,.3)',  textColor: '#f87171', bg: 'rgba(239,68,68,.05)'  },
  billing:  { border: 'rgba(251,191,36,.3)', textColor: '#fbbf24', bg: 'rgba(251,191,36,.05)' },
}

const ORDERS = [
  { id: '#1248', table: 'Mesa 2',     status: 'Cocinando', statusBg: 'rgba(251,191,36,.12)', statusColor: '#fbbf24', time: '12 min', total: '$3,450', client: 'Ana M.'     },
  { id: '#1247', table: 'Mesa 7',     status: 'Cocinando', statusBg: 'rgba(251,191,36,.12)', statusColor: '#fbbf24', time: '18 min', total: '$5,200', client: 'Roberto G.' },
  { id: '#1246', table: '🛵 Delivery',status: 'Listo',     statusBg: 'rgba(0,230,118,.12)',  statusColor: '#4ade80', time: '4 min',  total: '$2,100', client: '(anónimo)'  },
  { id: '#1245', table: 'Mesa 10',    status: 'Listo',     statusBg: 'rgba(0,230,118,.12)',  statusColor: '#4ade80', time: '2 min',  total: '$4,800', client: 'Lucía P.'   },
]

type Tab = 'mesas' | 'pedidos' | 'kds'

export default function AdminOperacionesPage() {
  const [tab, setTab] = useState<Tab>('mesas')

  return (
    <div className="min-h-screen md:ml-[240px] md:pt-16" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[1200px] mx-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-black" style={{ color: S.text }}>⚡ Operaciones</h1>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Mesas, pedidos y cocina en vivo</p>
          </div>
          <span className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl"
            style={{ backgroundColor: 'rgba(0,230,118,.12)', color: S.accent }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: S.accent }} /> EN VIVO
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          {(['mesas','pedidos','kds'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all"
              style={tab === t ? { backgroundColor: S.accent, color: '#000' } : { color: S.sub, backgroundColor: 'transparent' }}>
              {t === 'kds' ? 'KDS Cocina' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Mesas */}
        {tab === 'mesas' && (
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              {[['var(--ad-accent)','Libre'],['#ef4444','Ocupada'],['#fbbf24','Cuenta']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-2 text-sm" style={{ color: S.sub }}>
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />{l}
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[{ label: '🏠 Salón principal', tables: SALON }, { label: '🌿 Terraza', tables: TERRAZA }].map(sec => (
                <div key={sec.label}>
                  <p className="text-sm font-semibold mb-3" style={{ color: S.sub }}>{sec.label}</p>
                  <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2">
                    {sec.tables.map(t => {
                      const st = TABLE_STYLE[t.status]
                      return (
                        <div key={t.num} className="aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105"
                          style={{ border: `1px solid ${st.border}`, backgroundColor: st.bg }}>
                          <span className="font-black text-sm" style={{ color: st.textColor }}>{t.num}</span>
                          <span className="text-xs" style={{ color: S.sub }}>{t.time}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedidos */}
        {tab === 'pedidos' && (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                    {['#','Mesa','Estado','Tiempo','Total','Cliente'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: S.sub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ORDERS.map(o => (
                    <tr key={o.id} style={{ borderBottom: `1px solid ${S.border}` }} className="hover:bg-white/[.02]">
                      <td className="px-5 py-3 font-bold" style={{ color: S.text }}>{o.id}</td>
                      <td className="px-5 py-3" style={{ color: S.text }}>{o.table}</td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: o.statusBg, color: o.statusColor }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: o.statusColor }} />{o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3" style={{ color: S.sub }}>{o.time}</td>
                      <td className="px-5 py-3 font-bold" style={{ color: S.text }}>{o.total}</td>
                      <td className="px-5 py-3" style={{ color: S.sub }}>{o.client}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KDS */}
        {tab === 'kds' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              {
                title: '📥 En cola (3)', color: '#4f6ef7',
                items: [
                  { icon: '🍔', bg: 'rgba(59,130,246,.1)', text: '#1248 — 2x Hamburguesa', sub: 'Mesa 2 · 2 min' },
                  { icon: '🌮', bg: 'rgba(59,130,246,.1)', text: '#1244 — 3x Tacos',       sub: 'Mesa 4 · 1 min' },
                ],
              },
              {
                title: '🔥 Cocinando (5)', color: '#fbbf24',
                items: [
                  { icon: '🍕', bg: 'rgba(251,191,36,.1)', text: '#1247 — 2x Pizza', sub: 'Mesa 7 · 8 min'     },
                  { icon: '🥩', bg: 'rgba(239,68,68,.1)',  text: '#1241 — Ribeye',   sub: 'Mesa 9 · ⚠️ 32 min' },
                ],
              },
              {
                title: '✅ Listos (3)', color: 'var(--ad-accent)',
                items: [
                  { icon: '🍛', bg: 'rgba(0,230,118,.1)', text: '#1245 — Orden completa', sub: 'Mesa 10 · listo 2 min' },
                  { icon: '🛵', bg: 'rgba(0,230,118,.1)', text: '#1246 — Delivery listo', sub: 'Esperando rider'        },
                ],
              },
            ].map(col => (
              <div key={col.title} className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}`, borderTop: `2px solid ${col.color}` }}>
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
                  <span className="font-bold text-sm" style={{ color: S.text }}>{col.title}</span>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {col.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: item.bg }}>{item.icon}</div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: S.text }}>{item.text}</p>
                        <p className="text-xs" style={{ color: S.sub }}>{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
