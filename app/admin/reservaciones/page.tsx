'use client'

import { useState } from 'react'
import AdminNav from '@/app/components/AdminNav'

const S = {
  bg:     'var(--ad-bg)',
  card:   'var(--ad-card)',
  accent: 'var(--ad-accent)',
  text:   'var(--ad-text)',
  sub:    'var(--ad-sub)',
  border: 'var(--ad-border)',
  input:  '#0a0e1c',
}

const inputStyle = { backgroundColor: S.input, color: S.text, border: `1px solid rgba(0,230,118,0.25)` }
const INPUT_CLS = 'w-full rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors'

interface Reservation {
  id: number; name: string; time: string; guests: number; phone: string; notes: string; status: 'confirmed' | 'pending' | 'cancelled'
}

const DEMO: Reservation[] = [
  { id: 1, name: 'Carlos Mendoza',   time: '13:00', guests: 4, phone: '555-1234', notes: 'Aniversario', status: 'confirmed' },
  { id: 2, name: 'Ana García',       time: '13:30', guests: 2, phone: '555-5678', notes: '',             status: 'confirmed' },
  { id: 3, name: 'Roberto Silva',    time: '14:00', guests: 6, phone: '555-9012', notes: 'Cumpleaños',   status: 'pending'   },
  { id: 4, name: 'María López',      time: '15:00', guests: 3, phone: '555-3456', notes: '',             status: 'confirmed' },
  { id: 5, name: 'Jorge Ramírez',    time: '15:30', guests: 2, phone: '555-7890', notes: 'Ventana',      status: 'confirmed' },
  { id: 6, name: 'Patricia Torres',  time: '16:00', guests: 8, phone: '555-2345', notes: 'Evento corp.', status: 'pending'   },
  { id: 7, name: 'Luisa Hernández',  time: '18:00', guests: 2, phone: '555-6789', notes: '',             status: 'cancelled' },
]

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  confirmed: { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80', label: 'Confirmada' },
  pending:   { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', label: 'Pendiente'  },
  cancelled: { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', label: 'Cancelada'  },
}

function KPI({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
      <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: S.sub }}>{label}</p>
      <p className="text-2xl font-black" style={{ color: color ?? S.text }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: S.sub }}>{sub}</p>}
    </div>
  )
}

export default function AdminReservacionesPage() {
  const [reservations, setReservations] = useState<Reservation[]>(DEMO)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', time: '', guests: '2', phone: '', notes: '' })

  const confirmed = reservations.filter(r => r.status === 'confirmed').length
  const pending = reservations.filter(r => r.status === 'pending').length
  const cancelled = reservations.filter(r => r.status === 'cancelled').length
  const totalGuests = reservations.filter(r => r.status !== 'cancelled').reduce((s, r) => s + r.guests, 0)

  function addReservation() {
    if (!form.name.trim() || !form.time || !form.phone.trim()) return
    setReservations(prev => [
      ...prev,
      { id: Date.now(), name: form.name.trim(), time: form.time, guests: parseInt(form.guests) || 2,
        phone: form.phone.trim(), notes: form.notes.trim(), status: 'pending' },
    ])
    setForm({ name: '', time: '', guests: '2', phone: '', notes: '' })
    setShowForm(false)
  }

  function changeStatus(id: number, status: Reservation['status']) {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const sorted = [...reservations].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="min-h-screen md:ml-[240px] md:pt-16" style={{ backgroundColor: S.bg }}>
      <AdminNav />

      <div className="max-w-3xl mx-auto p-4 space-y-5">
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>Reservaciones</h1>
          <button onClick={() => setShowForm(p => !p)}
            className="text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ backgroundColor: S.accent, color: '#000' }}>
            + Nueva reserva
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPI label="Hoy" value={String(confirmed + pending)} sub="reservaciones" color={S.accent} />
          <KPI label="Confirmadas" value={String(confirmed)} sub="listas" />
          <KPI label="Pendientes" value={String(pending)} sub="por confirmar" />
          <KPI label="Comensales" value={String(totalGuests)} sub="esperados hoy" />
        </div>

        {showForm && (
          <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <h2 className="font-bold" style={{ color: S.accent }}>Nueva reservación</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: S.sub }}>Nombre *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Nombre del cliente" className={INPUT_CLS} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: S.sub }}>Teléfono *</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="555-0000" className={INPUT_CLS} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: S.sub }}>Hora *</label>
                <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                  className={INPUT_CLS} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: S.sub }}>Personas</label>
                <input type="number" value={form.guests} onChange={e => setForm(p => ({ ...p, guests: e.target.value }))}
                  min="1" max="20" className={INPUT_CLS} style={inputStyle} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: S.sub }}>Notas</label>
                <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Ej. Aniversario, cumpleaños..." className={INPUT_CLS} style={inputStyle} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addReservation}
                className="flex-1 font-bold py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: S.accent, color: '#000' }}>
                Agregar
              </button>
              <button onClick={() => setShowForm(false)}
                className="flex-1 font-bold py-2.5 rounded-xl text-sm"
                style={{ border: `1px solid ${S.border}`, color: S.sub, backgroundColor: 'transparent' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Reservations list */}
        <div className="space-y-2">
          {sorted.map(r => {
            const st = STATUS_STYLE[r.status]
            return (
              <div key={r.id} className="rounded-2xl p-4"
                style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="flex items-start gap-3">
                  <div className="text-center shrink-0">
                    <p className="font-black text-xl leading-none" style={{ color: S.accent }}>{r.time}</p>
                    <p className="text-xs mt-0.5" style={{ color: S.sub }}>{r.guests} pers.</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm" style={{ color: S.text }}>{r.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                    <p className="text-xs" style={{ color: S.sub }}>{r.phone}</p>
                    {r.notes && <p className="text-xs mt-0.5 font-medium" style={{ color: '#fbbf24' }}>📝 {r.notes}</p>}
                  </div>
                </div>
                {r.status !== 'cancelled' && (
                  <div className="flex gap-2 mt-3">
                    {r.status === 'pending' && (
                      <button onClick={() => changeStatus(r.id, 'confirmed')}
                        className="flex-1 py-1.5 rounded-xl text-sm font-medium"
                        style={{ border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80', backgroundColor: 'transparent' }}>
                        Confirmar
                      </button>
                    )}
                    <button onClick={() => changeStatus(r.id, 'cancelled')}
                      className="flex-1 py-1.5 rounded-xl text-sm font-medium"
                      style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', backgroundColor: 'transparent' }}>
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
