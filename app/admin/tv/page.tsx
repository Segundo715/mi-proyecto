'use client'

import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)',
  text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)',
}

export default function AdminTVPage() {
  return (
    <div className="min-h-screen md:ml-[240px] md:pt-16" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[1200px] mx-auto p-4 space-y-4">

        {/* Header */}
        <div className="pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>📺 Pantallas Digitales</h1>
          <p className="text-xs mt-0.5" style={{ color: S.sub }}>KDS, menú digital y señalización</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pantallas activas',    value: '5',       icon: '📺', color: S.accent  },
            { label: 'Menús QR escaneados',  value: '324',     icon: '📱', color: '#60a5fa' },
            { label: 'Tiempo prom. en menú', value: '4.2 min', icon: '⏱',  color: '#fbbf24' },
          ].map(k => (
            <div key={k.label} className="rounded-2xl p-5" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium" style={{ color: S.sub }}>{k.label}</p>
                <span className="text-xl">{k.icon}</span>
              </div>
              <p className="text-3xl font-black" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
