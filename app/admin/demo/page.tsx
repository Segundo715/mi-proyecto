'use client'

import { useState } from 'react'
import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)',
  text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)',
}

interface Phase {
  num: number
  titulo: string
  descripcion: string
  icono: string
  color: string
  acciones: { label: string; url: string; principal?: boolean }[]
  seed?: () => Promise<{ ok: boolean; created?: number; skipped?: number }>
}

const FASES: Phase[] = [
  {
    num: 1,
    titulo: 'Menú Digital',
    descripcion: 'Los clientes pueden escanear un QR, ver el menú completo con precios, fotos y descripción de cada platillo desde su teléfono. Sin descargar ninguna app.',
    icono: '🍽️',
    color: '#f59e0b',
    seed: () => fetch('/api/menu/seed', { method: 'POST' }).then(r => r.json()),
    acciones: [
      { label: 'Ver menú como cliente', url: '/menu', principal: true },
      { label: 'Administrar platillos', url: '/admin/menu' },
    ],
  },
  {
    num: 2,
    titulo: 'Recetario y Empleados',
    descripcion: 'El personal consulta recetas paso a paso desde su panel. El asistente de IA guía al cocinero con ingredientes y preparación en tiempo real.',
    icono: '👨‍🍳',
    color: '#10b981',
    acciones: [
      { label: 'Ver recetario', url: '/resetas', principal: true },
      { label: 'Panel de empleados', url: '/employee' },
      { label: 'Panel RESTA3', url: '/resta3' },
    ],
  },
  {
    num: 3,
    titulo: 'Sistema Completo',
    descripcion: 'Panel de administración con analíticas, pedidos en tiempo real, tarjetas de lealtad, reseñas de clientes, gestión de inventario y mucho más.',
    icono: '📊',
    color: '#a78bfa',
    acciones: [
      { label: 'Abrir panel admin', url: '/admin', principal: true },
      { label: 'Ver analíticas', url: '/admin/analytics' },
      { label: 'Tarjetas de lealtad', url: '/admin/tarjetas' },
    ],
  },
]

export default function DemoPage() {
  const [estado, setEstado] = useState<Record<number, 'idle' | 'loading' | 'done' | 'error'>>({})
  const [msg, setMsg]       = useState<Record<number, string>>({})

  async function activarFase(fase: Phase) {
    if (!fase.seed) return
    setEstado(p => ({ ...p, [fase.num]: 'loading' }))
    try {
      const res = await fase.seed()
      if (res.ok) {
        const txt = res.created === 0
          ? 'Datos ya cargados — listo para mostrar'
          : `${res.created} registros insertados correctamente`
        setMsg(p => ({ ...p, [fase.num]: txt }))
        setEstado(p => ({ ...p, [fase.num]: 'done' }))
      } else {
        setEstado(p => ({ ...p, [fase.num]: 'error' }))
        setMsg(p => ({ ...p, [fase.num]: 'Error al cargar datos' }))
      }
    } catch {
      setEstado(p => ({ ...p, [fase.num]: 'error' }))
      setMsg(p => ({ ...p, [fase.num]: 'Error de conexión' }))
    }
  }

  return (
    <div className="min-h-screen md:ml-[240px] md:pt-16" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[860px] mx-auto p-4 space-y-6">

        {/* Encabezado */}
        <div className="pt-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black"
              style={{ backgroundColor: 'var(--ad-accent)', color: '#000' }}>S</div>
            <div>
              <h1 className="text-xl font-black" style={{ color: S.text }}>
                Presentación <span style={{ color: 'var(--ad-accent)' }}>SELEI</span>
              </h1>
              <p className="text-xs" style={{ color: S.sub }}>
                Sistema Estratégico para la Elaboración e Implantación de Sistemas de Información
              </p>
            </div>
          </div>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: S.sub }}>
            Activa cada fase en orden para mostrar el sistema progresivamente. Empieza con el menú digital y avanza cuando el público esté listo.
          </p>
        </div>

        {/* Fases */}
        {FASES.map((fase) => {
          const st = estado[fase.num] ?? 'idle'
          return (
            <div key={fase.num} className="rounded-2xl p-5 space-y-4"
              style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>

              {/* Cabecera de fase */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: `${fase.color}18`, border: `2px solid ${fase.color}40` }}>
                  {fase.icono}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${fase.color}20`, color: fase.color }}>
                      Fase {fase.num}
                    </span>
                    {st === 'done' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                        ✓ Activada
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-black mt-1" style={{ color: S.text }}>{fase.titulo}</h2>
                  <p className="text-sm mt-0.5 leading-relaxed" style={{ color: S.sub }}>{fase.descripcion}</p>
                </div>
              </div>

              {/* Mensaje de resultado */}
              {msg[fase.num] && (
                <div className="rounded-xl px-4 py-2.5 text-sm font-medium"
                  style={{
                    backgroundColor: st === 'done' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: st === 'done' ? '#10b981' : '#f87171',
                    border: `1px solid ${st === 'done' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}>
                  {msg[fase.num]}
                </div>
              )}

              {/* Acciones */}
              <div className="flex flex-wrap gap-2 items-center">
                {fase.seed && (
                  <button
                    onClick={() => activarFase(fase)}
                    disabled={st === 'loading' || st === 'done'}
                    className="px-4 py-2.5 rounded-xl text-sm font-black disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: fase.color, color: '#000' }}>
                    {st === 'loading' ? 'Cargando datos…' : st === 'done' ? '✓ Datos listos' : `⚡ Activar Fase ${fase.num}`}
                  </button>
                )}
                {fase.acciones.map(a => (
                  <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                    style={a.principal
                      ? { backgroundColor: `${fase.color}20`, color: fase.color, border: `1px solid ${fase.color}40` }
                      : { backgroundColor: S.bg, color: S.sub, border: `1px solid ${S.border}` }}>
                    {a.principal ? '↗ ' : ''}{a.label}
                  </a>
                ))}
              </div>
            </div>
          )
        })}

        {/* Pie */}
        <div className="rounded-xl p-4 text-xs text-center" style={{ color: S.sub }}>
          Esta página es solo para la presentación. No es visible para clientes ni empleados.
        </div>
      </div>
    </div>
  )
}
