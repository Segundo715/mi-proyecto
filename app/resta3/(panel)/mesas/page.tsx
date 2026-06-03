'use client'

import { useState, useEffect } from 'react'
import Resta3Nav from '@/app/components/Resta3Nav'

const S = { bg: '#0a0d14', card: '#1a1d27', accent: '#f59e0b', text: '#f1f5f9', sub: '#64748b', border: 'rgba(245,158,11,0.1)' }

type TableStatus = 'libre' | 'ocupada' | 'reservada' | 'limpieza'
interface Table { id: string; label: string; seats: number; status: TableStatus; customer?: string; since?: string; zone: string }

const STATUS_CFG: Record<TableStatus, { label: string; color: string; bg: string; border: string }> = {
  libre:     { label: 'Libre',     color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)' },
  ocupada:   { label: 'Ocupada',   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.35)' },
  reservada: { label: 'Reservada', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' },
  limpieza:  { label: 'Limpieza',  color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)' },
}
const NEXT_STATUS: Record<TableStatus, TableStatus> = { libre: 'ocupada', ocupada: 'limpieza', limpieza: 'libre', reservada: 'ocupada' }

export default function MesasPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TableStatus | 'todas'>('todas')
  const [zone, setZone] = useState('todas')
  const [saving, setSaving] = useState<string | null>(null)

  async function load() {
    const r = await fetch('/api/resta3/tables')
    if (r.ok) setTables(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function cycleStatus(table: Table) {
    const next = NEXT_STATUS[table.status]
    const since = next === 'ocupada' ? new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : null
    setSaving(table.id)
    await fetch(`/api/resta3/tables/${table.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next, since, customer: (next === 'libre' || next === 'limpieza') ? null : table.customer }),
    })
    await load()
    setSaving(null)
  }

  const zones = ['todas', ...Array.from(new Set(tables.map(t => t.zone)))]
  const displayed = tables.filter(t => (filter === 'todas' || t.status === filter) && (zone === 'todas' || t.zone === zone))

  const stats = {
    libre:     tables.filter(t => t.status === 'libre').length,
    ocupada:   tables.filter(t => t.status === 'ocupada').length,
    reservada: tables.filter(t => t.status === 'reservada').length,
    limpieza:  tables.filter(t => t.status === 'limpieza').length,
  }
  const occupancy = tables.length ? Math.round((stats.ocupada / tables.length) * 100) : 0

  return (
    <div className="min-h-screen md:ml-[220px]" style={{ backgroundColor: S.bg }}>
      <Resta3Nav />
      <div className="max-w-[1000px] mx-auto p-4 space-y-4">

        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-black" style={{ color: S.text }}>Gestión de Mesas</h1>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>{tables.length} mesas · {occupancy}% ocupación</p>
          </div>
          <span className="text-sm font-black px-3 py-1.5 rounded-xl" style={{ backgroundColor: `${S.accent}18`, color: S.accent }}>
            {stats.ocupada} ocupadas
          </span>
        </div>

        {/* Stats filtro */}
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(stats) as [TableStatus, number][]).map(([status, count]) => {
            const cfg = STATUS_CFG[status]
            return (
              <button key={status} onClick={() => setFilter(filter === status ? 'todas' : status)}
                className="rounded-xl p-3 text-center transition-all"
                style={{ backgroundColor: filter === status ? cfg.bg : S.card, border: `1px solid ${filter === status ? cfg.border : S.border}` }}>
                <p className="text-xl font-black" style={{ color: cfg.color }}>{count}</p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
              </button>
            )
          })}
        </div>

        {/* Filtro zona */}
        {zones.length > 2 && (
          <div className="flex gap-2 flex-wrap">
            {zones.map(z => (
              <button key={z} onClick={() => setZone(z)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize"
                style={zone === z ? { backgroundColor: `${S.accent}22`, color: S.accent, border: `1px solid ${S.accent}44` } : { backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
                {z}
              </button>
            ))}
          </div>
        )}

        {/* Plano */}
        {loading ? (
          <div className="text-center py-16 text-sm" style={{ color: S.sub }}>Cargando mesas...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {displayed.map(table => {
              const cfg = STATUS_CFG[table.status]
              return (
                <button key={table.id} onClick={() => saving !== table.id && cycleStatus(table)}
                  disabled={saving === table.id}
                  className="rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                  style={{ backgroundColor: S.card, border: `2px solid ${cfg.border}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-black text-sm" style={{ color: S.text }}>{table.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2 flex-wrap">
                    {Array.from({ length: table.seats }).map((_, i) => (
                      <div key={i} className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: table.status === 'ocupada' ? cfg.color : 'rgba(255,255,255,0.1)' }} />
                    ))}
                    <span className="text-[10px] ml-1" style={{ color: S.sub }}>{table.seats}p</span>
                  </div>
                  {table.customer && <p className="text-xs font-bold truncate" style={{ color: S.sub }}>{table.customer}</p>}
                  {table.since && <p className="text-xs" style={{ color: S.sub }}>desde {table.since}</p>}
                  <p className="text-[9px] mt-2" style={{ color: 'rgba(255,255,255,0.15)' }}>
                    {saving === table.id ? 'Guardando...' : '↻ Toca para cambiar'}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
