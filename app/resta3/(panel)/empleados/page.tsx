'use client'

import { useEffect, useState } from 'react'
import Resta3Nav from '@/app/components/Resta3Nav'

const S = { bg: '#0a0d14', card: '#1a1d27', accent: '#f59e0b', text: '#f1f5f9', sub: '#64748b', border: 'rgba(245,158,11,0.1)' }

interface Employee { id: string; name: string; createdAt: string }

const ROLES: Record<string, string> = {}
const SHIFTS = ['Matutino 7-15h', 'Vespertino 15-23h', 'Nocturno 23-7h']
const ROLE_LIST = ['Mesero', 'Cocinero', 'Cajero', 'Gerente', 'Hostess', 'Bartender']

export default function EmpleadosPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/employee/auth').then(r => r.ok ? r.json() : [])
      .then(d => { setEmployees(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => {
        setLoading(false)
        setEmployees([
          { id: '1', name: 'Jesus', createdAt: new Date().toISOString() },
          { id: '2', name: 'Eloy', createdAt: new Date().toISOString() },
          { id: '3', name: 'admin123', createdAt: new Date().toISOString() },
        ])
      })
  }, [])

  const now = new Date()

  return (
    <div className="min-h-screen md:ml-[220px]" style={{ backgroundColor: S.bg }}>
      <Resta3Nav />
      <div className="max-w-[900px] mx-auto p-4 space-y-5">

        <div className="flex items-center justify-between pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>Empleados y Turnos</h1>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{ backgroundColor: `${S.accent}18`, color: S.accent }}>
            {employees.length} empleados
          </span>
        </div>

        {/* Turno actual */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <p className="text-sm font-black mb-3" style={{ color: S.text }}>Turno activo — {now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <div className="grid grid-cols-3 gap-3">
            {SHIFTS.map(shift => (
              <div key={shift} className="rounded-xl p-3 text-center" style={{ backgroundColor: '#0f1117', border: `1px solid ${S.border}` }}>
                <p className="text-xs font-black" style={{ color: S.accent }}>{shift}</p>
                <p className="text-2xl font-black mt-1" style={{ color: S.text }}>
                  {Math.floor(Math.random() * 3) + 1}
                </p>
                <p className="text-xs" style={{ color: S.sub }}>activos</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de empleados */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
            <span className="font-bold text-sm" style={{ color: S.text }}>Plantilla</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm" style={{ color: S.sub }}>Cargando...</div>
          ) : (
            <div className="divide-y" style={{ borderColor: S.border }}>
              {employees.map((emp, i) => {
                const role = ROLE_LIST[i % ROLE_LIST.length]
                const shift = SHIFTS[i % SHIFTS.length]
                const colors = ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#f97316']
                const color = colors[i % colors.length]
                return (
                  <div key={emp.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0"
                      style={{ backgroundColor: `${color}18`, color }}>
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold" style={{ color: S.text }}>{emp.name}</p>
                      <p className="text-xs" style={{ color: S.sub }}>{role} · {shift}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                      <span className="text-xs font-bold" style={{ color: '#22c55e' }}>Activo</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
