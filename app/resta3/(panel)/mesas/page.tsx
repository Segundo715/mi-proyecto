'use client'

import { useState } from 'react'
import Resta3Nav from '@/app/components/Resta3Nav'

const S = { bg: '#0a0d14', card: '#1a1d27', accent: '#f59e0b', text: '#f1f5f9', sub: '#64748b', border: 'rgba(245,158,11,0.1)' }

type TableStatus = 'libre' | 'ocupada' | 'reservada' | 'limpieza'

interface Table { id: number; label: string; seats: number; status: TableStatus; customer?: string; since?: string }

const INITIAL: Table[] = [
  { id: 1, label: 'Mesa 1', seats: 2, status: 'libre' },
  { id: 2, label: 'Mesa 2', seats: 4, status: 'ocupada', customer: 'González', since: '19:30' },
  { id: 3, label: 'Mesa 3', seats: 4, status: 'ocupada', customer: 'Martínez', since: '20:00' },
  { id: 4, label: 'Mesa 4', seats: 6, status: 'reservada', customer: 'Rodríguez' },
  { id: 5, label: 'Mesa 5', seats: 2, status: 'libre' },
  { id: 6, label: 'Mesa 6', seats: 4, status: 'limpieza' },
  { id: 7, label: 'Mesa 7', seats: 8, status: 'libre' },
  { id: 8, label: 'Mesa 8', seats: 4, status: 'ocupada', customer: 'López', since: '20:15' },
  { id: 9, label: 'Barra 1', seats: 1, status: 'libre' },
  { id: 10, label: 'Barra 2', seats: 1, status: 'ocupada', customer: 'Cliente', since: '20:45' },
  { id: 11, label: 'Terraza 1', seats: 4, status: 'libre' },
  { id: 12, label: 'Terraza 2', seats: 4, status: 'reservada', customer: 'Hernández' },
]

const STATUS_CFG: Record<TableStatus, { label: string; color: string; bg: string }> = {
  libre:     { label: 'Libre',     color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  ocupada:   { label: 'Ocupada',   color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  reservada: { label: 'Reservada', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  limpieza:  { label: 'Limpieza',  color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
}

const NEXT: Record<TableStatus, TableStatus> = {
  libre: 'ocupada', ocupada: 'limpieza', limpieza: 'libre', reservada: 'ocupada',
}

export default function MesasPage() {
  const [tables, setTables] = useState<Table[]>(INITIAL)
  const [filter, setFilter] = useState<TableStatus | 'todas'>('todas')

  function cycleStatus(id: number) {
    setTables(t => t.map(table =>
      table.id === id ? { ...table, status: NEXT[table.status], since: NEXT[table.status] === 'ocupada' ? new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : undefined } : table
    ))
  }

  const displayed = filter === 'todas' ? tables : tables.filter(t => t.status === filter)
  const stats = { libre: tables.filter(t => t.status === 'libre').length, ocupada: tables.filter(t => t.status === 'ocupada').length, reservada: tables.filter(t => t.status === 'reservada').length, limpieza: tables.filter(t => t.status === 'limpieza').length }
  const occupancy = Math.round((stats.ocupada / tables.length) * 100)

  return (
    <div className="min-h-screen md:ml-[220px]" style={{ backgroundColor: S.bg }}>
      <Resta3Nav />
      <div className="max-w-[1000px] mx-auto p-4 space-y-4">

        <div className="flex items-center justify-between pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>Gestión de Mesas</h1>
          <span className="text-sm font-black px-3 py-1.5 rounded-xl" style={{ backgroundColor: `${S.accent}18`, color: S.accent }}>
            {occupancy}% ocupación
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(stats) as [TableStatus, number][]).map(([status, count]) => {
            const cfg = STATUS_CFG[status]
            return (
              <button key={status} onClick={() => setFilter(filter === status ? 'todas' : status)}
                className="rounded-xl p-3 text-center transition-all"
                style={{ backgroundColor: filter === status ? cfg.bg : S.card, border: `1px solid ${filter === status ? cfg.color + '44' : S.border}` }}>
                <p className="text-xl font-black" style={{ color: cfg.color }}>{count}</p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
              </button>
            )
          })}
        </div>

        {/* Plano */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {displayed.map(table => {
            const cfg = STATUS_CFG[table.status]
            return (
              <button key={table.id} onClick={() => cycleStatus(table.id)}
                className="rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-95"
                style={{ backgroundColor: S.card, border: `2px solid ${cfg.color}44` }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="font-black text-sm" style={{ color: S.text }}>{table.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: table.seats }).map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: table.status === 'ocupada' ? cfg.color : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
                {table.customer && <p className="text-xs font-bold truncate" style={{ color: S.sub }}>{table.customer}</p>}
                {table.since && <p className="text-xs" style={{ color: S.sub }}>desde {table.since}</p>}
                <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>Toca para cambiar estado</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
