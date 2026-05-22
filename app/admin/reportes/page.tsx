'use client'

import AdminNav from '@/app/components/AdminNav'

const S = {
  bg:     '#080b16',
  card:   '#0e1225',
  accent: '#00e676',
  text:   '#eef2f7',
  sub:    '#6b7a94',
  border: 'rgba(255,255,255,0.07)',
}

const REPORTS = [
  {
    title: 'Reporte de Ventas',
    description: 'Ingresos totales, ticket promedio, productos más vendidos y tendencias por período.',
    icon: '💰', period: 'Mensual', color: S.accent,
    formats: ['PDF', 'Excel'],
  },
  {
    title: 'Reporte de Clientes',
    description: 'Análisis de fidelización, segmentación por visitas, nuevos registros y tasa de retención.',
    icon: '👥', period: 'Mensual', color: '#4f6ef7',
    formats: ['PDF', 'Excel', 'CSV'],
  },
  {
    title: 'Reporte de Inventario',
    description: 'Stock actual, rotación de productos, costo de inventario y órdenes de compra pendientes.',
    icon: '📦', period: 'Semanal', color: '#fb923c',
    formats: ['PDF', 'Excel'],
  },
  {
    title: 'Reporte de Fidelización',
    description: 'Sellos emitidos, premios canjeados, clientes por nivel y eficiencia del programa.',
    icon: '☕', period: 'Mensual', color: '#fbbf24',
    formats: ['PDF'],
  },
  {
    title: 'Reporte de Marketing',
    description: 'ROI por canal, alcance total, leads generados y conversiones de campañas activas.',
    icon: '📣', period: 'Mensual', color: '#c084fc',
    formats: ['PDF', 'Excel'],
  },
  {
    title: 'Reporte de Reseñas',
    description: 'Calificación promedio, tendencia de reputación, reseñas por plataforma y temas frecuentes.',
    icon: '⭐', period: 'Semanal', color: '#f59e0b',
    formats: ['PDF'],
  },
  {
    title: 'Reporte de Operaciones',
    description: 'Tiempo promedio de preparación, órdenes por hora, mesas más ocupadas y eficiencia de cocina.',
    icon: '🏭', period: 'Diario', color: '#06b6d4',
    formats: ['PDF', 'Excel'],
  },
  {
    title: 'Reporte de Reservaciones',
    description: 'Ocupación por día, cancelaciones, no-shows y reservaciones recurrentes.',
    icon: '📅', period: 'Semanal', color: '#4ade80',
    formats: ['PDF'],
  },
]

const PERIOD_COLOR: Record<string, { bg: string; color: string }> = {
  Diario:  { bg: 'rgba(6,182,212,0.15)',   color: '#06b6d4' },
  Semanal: { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  Mensual: { bg: 'rgba(0,230,118,0.15)',   color: '#00e676' },
}

export default function AdminReportesPage() {
  function download(title: string, format: string) {
    alert(`Generando ${title} en ${format}... (Funcionalidad próximamente)`)
  }

  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <AdminNav />

      <div className="max-w-3xl mx-auto p-4 space-y-5">
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>Reportes</h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(0,230,118,0.1)', color: S.accent }}>
            {REPORTS.length} disponibles
          </span>
        </div>

        <div className="space-y-3">
          {REPORTS.map(report => {
            const period = PERIOD_COLOR[report.period]
            return (
              <div key={report.title} className="rounded-2xl p-4"
                style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: `${report.color}18` }}>
                    {report.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="font-bold text-sm" style={{ color: S.text }}>{report.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: period.bg, color: period.color }}>{report.period}</span>
                    </div>
                    <p className="text-xs" style={{ color: S.sub }}>{report.description}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  {report.formats.map(fmt => (
                    <button key={fmt} onClick={() => download(report.title, fmt)}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold transition-colors"
                      style={fmt === 'PDF'
                        ? { backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
                        : fmt === 'Excel'
                        ? { backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }
                        : { backgroundColor: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
                      }>
                      ↓ {fmt}
                    </button>
                  ))}
                  <button
                    className="ml-auto px-4 py-1.5 rounded-xl text-xs font-bold"
                    style={{ backgroundColor: 'rgba(0,230,118,0.1)', color: S.accent, border: '1px solid rgba(0,230,118,0.3)' }}>
                    Ver detalle →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
