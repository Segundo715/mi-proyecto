'use client'

import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)',
  text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)',
}

const HOURS_DATA = [800,400,200,100,1200,3500,8200,12400,9800,15600,22400,24580,18200]
const HOURS_MAX  = Math.max(...HOURS_DATA)

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-0.5 h-7">
      {data.map((v, i) => (
        <div key={i} className="w-1 rounded-sm" style={{ height: `${Math.max(4, (v / max) * 28)}px`, backgroundColor: color, opacity: 0.7 }} />
      ))}
    </div>
  )
}

const KPIS = [
  { label: 'Ventas del día',   value: '$24,580', delta: '↑ 18.2% vs ayer', icon: '💰', iconBg: 'rgba(99,102,241,.15)',  iconColor: '#818cf8', spark: [12,18,14,22,19,26,24,30,28,35], sc: '#818cf8' },
  { label: 'Tickets promedio', value: '$320',    delta: '↑ 8.7% vs ayer',  icon: '🧾', iconBg: 'rgba(34,197,94,.12)',  iconColor: '#4ade80', spark: [8,10,9,12,11,14,13,15,14,16],  sc: '#4ade80' },
  { label: 'Clientes nuevos',  value: '128',     delta: '↑ 15.4% vs ayer', icon: '👥', iconBg: 'rgba(59,130,246,.12)', iconColor: '#60a5fa', spark: [5,8,6,10,9,14,12,16,15,18],   sc: '#60a5fa' },
  { label: 'Reservaciones',    value: '42',      delta: '↑ 12.6% vs ayer', icon: '📅', iconBg: 'rgba(168,85,247,.12)', iconColor: '#c084fc', spark: [3,5,4,6,5,8,7,9,8,10],       sc: '#c084fc' },
  { label: 'ROI de campañas',  value: '4.2x',    delta: '↑ 22.1% vs ayer', icon: '📈', iconBg: 'rgba(0,230,118,.12)', iconColor: 'var(--ad-accent)', spark: [2,3,2.5,3.5,3,4,3.8,4.2,4,4.5], sc: 'var(--ad-accent)' },
]

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen md:ml-[240px] md:pt-16" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[1200px] mx-auto p-4 space-y-4">

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {KPIS.map(k => (
            <div key={k.label} className="rounded-2xl p-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium" style={{ color: S.sub }}>{k.label}</p>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: k.iconBg }}>{k.icon}</span>
              </div>
              <p className="text-[1.7rem] font-black leading-none mb-2" style={{ color: S.text }}>{k.value}</p>
              <div className="flex items-end justify-between">
                <span className="text-xs font-medium" style={{ color: '#4ade80' }}>{k.delta}</span>
                <Spark data={k.spark} color={k.sc} />
              </div>
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Ventas chart */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Ventas</span>
              <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--ad-overlay)', color: S.sub }}>Hoy ▾</span>
            </div>
            <div className="px-5 py-4">
              <p className="text-2xl font-black" style={{ color: S.text }}>$24,580</p>
              <p className="text-sm font-medium mb-4" style={{ color: '#4ade80' }}>↑ 18.2%</p>
              <div className="flex items-end gap-1 h-28">
                {HOURS_DATA.map((v, i) => (
                  <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${Math.max(3, (v / HOURS_MAX) * 112)}px`, background: 'linear-gradient(180deg,#6366f1,#3b82f6)' }} />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {['00h','06h','12h','18h','24h'].map(t => <span key={t} className="text-xs" style={{ color: S.sub }}>{t}</span>)}
              </div>
            </div>
          </div>

          {/* Embudo */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Embudo de ventas</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { name: 'Impresiones', value: '32,450', pct: 100, bar: 'linear-gradient(90deg,#3b82f6,#60a5fa)', color: '#3b82f6' },
                { name: 'Clics',       value: '4,820',  pct: 60,  bar: 'linear-gradient(90deg,#6366f1,#818cf8)', color: '#6366f1' },
                { name: 'Leads',       value: '812',    pct: 38,  bar: 'linear-gradient(90deg,#7c3aed,#a78bfa)', color: '#7c3aed' },
                { name: 'Reservas',    value: '215',    pct: 22,  bar: 'linear-gradient(90deg,#a855f7,#c084fc)', color: '#a855f7' },
                { name: 'Ventas',      value: '128',    pct: 14,  bar: 'linear-gradient(90deg,#22c55e,#4ade80)', color: '#22c55e' },
              ].map(f => (
                <div key={f.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium" style={{ color: S.sub }}>{f.name}</span>
                    <div className="flex gap-3">
                      <span className="text-xs font-bold" style={{ color: f.color }}>{f.value}</span>
                      <span className="text-xs w-8 text-right" style={{ color: S.sub }}>{f.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--ad-overlay)' }}>
                    <div className="h-2 rounded-full" style={{ width: `${f.pct}%`, background: f.bar }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Actividad en tiempo real</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { icon: '🛒', bg: 'rgba(0,230,118,.1)',   text: 'Nueva venta',        sub: '$850',        time: 'Hace 1 min' },
                { icon: '📅', bg: 'rgba(168,85,247,.1)',  text: 'Nueva reservación',  sub: '4 personas',  time: 'Hace 2 min' },
                { icon: '👤', bg: 'rgba(59,130,246,.1)',  text: 'Nuevo cliente',       sub: 'María García', time: 'Hace 5 min' },
                { icon: '💬', bg: 'rgba(34,197,94,.1)',   text: 'Mensaje recibido',    sub: 'WhatsApp',    time: 'Hace 6 min' },
                { icon: '💳', bg: 'rgba(251,191,36,.1)',  text: 'Tarjeta utilizada',   sub: 'Juan Pérez',  time: 'Hace 7 min' },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: a.bg }}>{a.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: S.text }}>{a.text}</p>
                    <p className="text-xs" style={{ color: S.sub }}>{a.sub}</p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: S.sub }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Campañas */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Campañas activas</span>
            </div>
            <div className="px-5 py-4 space-y-4">
              {[
                { logo: 'Ⓜ', bg: '#1877f2', name: 'Campaña Verano',   platform: 'Meta Ads',    roi: '3.8x', spend: '$1,250', bar: 72, bc: 'var(--ad-accent)' },
                { logo: '♪', bg: '#000',     name: 'Promo 2x1 Sushi', platform: 'TikTok Ads',  roi: '5.2x', spend: '$950',  bar: 85, bc: '#a855f7' },
                { logo: 'G', bg: '#ea4335',  name: 'Búsqueda Nicho',  platform: 'Google Ads',  roi: '2.9x', spend: '$780',  bar: 58, bc: '#4f6ef7' },
              ].map(c => (
                <div key={c.name}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0" style={{ backgroundColor: c.bg }}>{c.logo}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: S.text }}>{c.name}</span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: S.accent }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: S.accent }} />Activa
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: S.sub }}>{c.platform}</p>
                    </div>
                    <div className="text-right shrink-0 text-xs" style={{ color: S.sub }}>
                      <p>ROI <strong style={{ color: S.text }}>{c.roi}</strong></p>
                      <p>Gasto <strong style={{ color: S.text }}>{c.spend}</strong></p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full ml-12" style={{ backgroundColor: 'var(--ad-overlay)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${c.bar}%`, backgroundColor: c.bc }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3" style={{ borderTop: `1px solid ${S.border}` }}>
              <span className="text-xs font-semibold" style={{ color: S.accent }}>Ver todas las campañas →</span>
            </div>
          </div>

          {/* Productos */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Productos más vendidos</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { rank: 1, rc: '#c084fc', emoji: '🍣', name: 'Sushi Premium',    sold: '245 vendidos', amount: '$8,450', change: '↑ 12%' },
                { rank: 2, rc: '#fbbf24', emoji: '🥩', name: 'Rib Eye 400g',    sold: '189 vendidos', amount: '$7,120', change: '↑ 8%'  },
                { rank: 3, rc: '#60a5fa', emoji: '🌮', name: 'Tacos de Rib Eye', sold: '156 vendidos', amount: '$4,680', change: '↑ 15%' },
                { rank: 4, rc: '#94a3b8', emoji: '🍹', name: 'Margarita Clásica', sold: '132 vendidos', amount: '$2,380', change: '↑ 5%'  },
              ].map(p => (
                <div key={p.rank} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0" style={{ backgroundColor: `${p.rc}20`, color: p.rc }}>{p.rank}</div>
                  <span className="text-xl shrink-0">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: S.text }}>{p.name}</p>
                    <p className="text-xs" style={{ color: S.sub }}>{p.sold}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: S.text }}>{p.amount}</p>
                    <p className="text-xs font-medium" style={{ color: '#4ade80' }}>{p.change}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3" style={{ borderTop: `1px solid ${S.border}` }}>
              <span className="text-xs font-semibold" style={{ color: S.accent }}>Ver menú completo →</span>
            </div>
          </div>

          {/* Automatizaciones */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Automatizaciones IA</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { icon: '📅', bg: 'rgba(0,230,118,.1)',  name: 'Agente de Reservas'    },
                { icon: '🔄', bg: 'rgba(59,130,246,.1)', name: 'Agente de Seguimiento' },
                { icon: '⭐', bg: 'rgba(168,85,247,.1)', name: 'Agente de Reputación'  },
                { icon: '📣', bg: 'rgba(6,182,212,.1)',  name: 'Agente de Marketing'   },
              ].map(a => (
                <div key={a.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: a.bg }}>{a.icon}</div>
                  <span className="flex-1 text-sm font-medium" style={{ color: S.text }}>{a.name}</span>
                  <span className="flex items-center gap-1 text-xs font-medium" style={{ color: S.accent }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: S.accent }} />Activo
                  </span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3" style={{ borderTop: `1px solid ${S.border}` }}>
              <span className="text-xs font-semibold" style={{ color: S.accent }}>Ver todas las automatizaciones →</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
