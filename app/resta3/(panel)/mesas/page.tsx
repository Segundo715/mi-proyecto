'use client'

// Gestión de mesas: tap sobre mesa → modal para cambiar estado + nombre del cliente.
// Persiste en Supabase (tabla tables) vía PATCH /api/resta3/tables/:id.
import { useState, useEffect } from 'react'
import Resta3Nav from '@/app/components/Resta3Nav'

const S = { bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)', text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)' }

type TableStatus = 'libre' | 'ocupada' | 'reservada' | 'limpieza'
interface Table { id: string; label: string; seats: number; status: TableStatus; customer?: string; since?: string; zone: string }

const STATUS_CFG: Record<TableStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  libre:     { label: 'Libre',     color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  icon: '🟢' },
  ocupada:   { label: 'Ocupada',   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.35)', icon: '🔴' },
  reservada: { label: 'Reservada', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', icon: '🔵' },
  limpieza:  { label: 'Limpieza',  color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)', icon: '🟣' },
}

export default function MesasPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TableStatus | 'todas'>('todas')
  const [zone, setZone] = useState('todas')
  const [saving, setSaving] = useState(false)

  // Modal de acción
  const [modal, setModal] = useState<Table | null>(null)
  const [customerInput, setCustomerInput] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<TableStatus>('libre')

  async function load() {
    const r = await fetch('/api/resta3/tables')
    if (r.ok) setTables(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openModal(table: Table) {
    setModal(table)
    setSelectedStatus(table.status)
    setCustomerInput(table.customer ?? '')
  }

  function closeModal() {
    setModal(null)
    setCustomerInput('')
  }

  async function applyChange() {
    if (!modal) return
    setSaving(true)
    const since = selectedStatus === 'ocupada' || selectedStatus === 'reservada'
      ? new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      : null
    await fetch(`/api/resta3/tables/${modal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: selectedStatus,
        customer: customerInput.trim() || null,
        since: (selectedStatus === 'libre' || selectedStatus === 'limpieza') ? null : (modal.since ?? since),
      }),
    })
    await load()
    setSaving(false)
    closeModal()
  }

  const zones = ['todas', ...Array.from(new Set(tables.map(t => t.zone)))]
  const displayed = tables.filter(t =>
    (filter === 'todas' || t.status === filter) &&
    (zone === 'todas' || t.zone === zone)
  )

  const stats = {
    libre:     tables.filter(t => t.status === 'libre').length,
    ocupada:   tables.filter(t => t.status === 'ocupada').length,
    reservada: tables.filter(t => t.status === 'reservada').length,
    limpieza:  tables.filter(t => t.status === 'limpieza').length,
  }
  const occupancy = tables.length ? Math.round((stats.ocupada / tables.length) * 100) : 0

  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
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
                style={zone === z
                  ? { backgroundColor: `${S.accent}22`, color: S.accent, border: `1px solid ${S.accent}44` }
                  : { backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
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
                <button key={table.id} onClick={() => openModal(table)}
                  className="rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-95"
                  style={{ backgroundColor: S.card, border: `2px solid ${cfg.border}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-black text-sm" style={{ color: S.text }}>{table.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2 flex-wrap">
                    {Array.from({ length: table.seats }).map((_, i) => (
                      <div key={i} className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: table.status === 'ocupada' ? cfg.color : table.status === 'reservada' ? `${cfg.color}66` : 'rgba(255,255,255,0.1)' }} />
                    ))}
                    <span className="text-[10px] ml-1" style={{ color: S.sub }}>{table.seats}p</span>
                  </div>
                  {table.customer && <p className="text-xs font-bold truncate" style={{ color: S.text }}>{table.customer}</p>}
                  {table.since && <p className="text-xs" style={{ color: S.sub }}>desde {table.since}</p>}
                  <p className="text-[9px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>Toca para gestionar</p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal gestión de mesa */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={closeModal}>
          <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 space-y-4"
            style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-lg" style={{ color: S.text }}>{modal.label}</h2>
                <p className="text-xs" style={{ color: S.sub }}>{modal.seats} personas · {modal.zone}</p>
              </div>
              <button onClick={closeModal} style={{ color: S.sub }} className="text-xl">✕</button>
            </div>

            {/* Nombre del cliente */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: S.sub }}>
                Nombre del cliente / reserva
              </label>
              <input
                value={customerInput}
                onChange={e => setCustomerInput(e.target.value)}
                placeholder="Ej: González, Reserva 8pm..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }}
              />
            </div>

            {/* Seleccionar estado */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: S.sub }}>
                Estado de la mesa
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(STATUS_CFG) as [TableStatus, typeof STATUS_CFG[TableStatus]][]).map(([status, cfg]) => (
                  <button key={status} onClick={() => setSelectedStatus(status)}
                    className="py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    style={selectedStatus === status
                      ? { backgroundColor: cfg.bg, color: cfg.color, border: `2px solid ${cfg.color}` }
                      : { backgroundColor: S.bg, color: S.sub, border: `1px solid ${S.border}` }}>
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Botón aplicar */}
            <button onClick={applyChange} disabled={saving}
              className="w-full py-3.5 rounded-xl font-black text-sm disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }}>
              {saving ? 'Guardando...' : `Aplicar cambio → ${STATUS_CFG[selectedStatus].label}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
