'use client'

import { useState } from 'react'
import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)',
  text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)',
}

const TABS = [
  { id: 'diagnostico',   icono: '🔍', titulo: 'Diagnóstico',   color: '#ef4444' },
  { id: 'analisis',      icono: '📋', titulo: 'Análisis',       color: '#f59e0b' },
  { id: 'diseno',        icono: '🏗️', titulo: 'Diseño',         color: '#06b6d4' },
  { id: 'elaboracion',   icono: '⚙️', titulo: 'Elaboración',    color: '#10b981' },
  { id: 'implantacion',  icono: '🚀', titulo: 'Implantación',   color: '#a78bfa' },
]

type FaseEstado = 'idle' | 'loading' | 'done' | 'error'

const FASES = [
  {
    num: 1, titulo: 'Menú Digital', color: '#f59e0b', icono: '🍽️',
    desc: '8 platillos en 5 categorías listos para mostrar al público',
    url: '/menu',
    urlLabel: 'Ver menú como cliente',
  },
  {
    num: 2, titulo: 'Recetario y Empleados', color: '#10b981', icono: '👨‍🍳',
    desc: 'Recetas paso a paso + asistente de IA para el personal',
    url: '/resetas',
    urlLabel: 'Ver recetario',
  },
  {
    num: 3, titulo: 'Sistema Completo', color: '#a78bfa', icono: '📊',
    desc: 'Analíticas, lealtad, inventario, reservaciones y más',
    url: '/admin',
    urlLabel: 'Abrir panel admin',
  },
]

export default function SeleiPage() {
  const [activa, setActiva]   = useState(0)
  const [faseEst, setFaseEst] = useState<Record<number, FaseEstado>>({})
  const [faseMsg, setFaseMsg] = useState<Record<number, string>>({})

  async function activarFase(num: number) {
    if (num !== 1) return // solo fase 1 requiere seed
    setFaseEst(p => ({ ...p, [num]: 'loading' }))
    try {
      const res = await fetch('/api/menu/seed', { method: 'POST' }).then(r => r.json())
      if (res.ok) {
        const txt = res.created === 0 ? 'Datos ya cargados — listo para mostrar' : `${res.created} platillos insertados correctamente`
        setFaseMsg(p => ({ ...p, [num]: txt }))
        setFaseEst(p => ({ ...p, [num]: 'done' }))
      } else {
        setFaseEst(p => ({ ...p, [num]: 'error' }))
        setFaseMsg(p => ({ ...p, [num]: 'Error al cargar datos' }))
      }
    } catch {
      setFaseEst(p => ({ ...p, [num]: 'error' }))
      setFaseMsg(p => ({ ...p, [num]: 'Error de conexión' }))
    }
  }

  const tab = TABS[activa]

  function renderContenido() {
    switch (tab.id) {

      case 'diagnostico':
        return (
          <div className="space-y-5">
            <p className="text-sm leading-relaxed" style={{ color: S.sub }}>
              Los restaurantes pequeños y medianos enfrentan problemas operativos que afectan sus ventas y la experiencia del cliente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { prob: 'Menú solo en papel',       imp: 'Clientes no pueden verlo desde su teléfono' },
                { prob: 'Sin sistema de lealtad',   imp: 'Se pierden clientes frecuentes, sin registro' },
                { prob: 'Pedidos por libreta',      imp: 'Errores, pedidos perdidos, sin trazabilidad' },
                { prob: 'Recetas solo en memoria',  imp: 'Si falta el chef, la producción se para' },
                { prob: 'Sin analíticas de ventas', imp: 'El dueño no sabe qué platillos venden más' },
                { prob: 'Reseñas ignoradas',        imp: 'La reputación cae sin que el dueño lo note' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-3.5 space-y-1"
                  style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <p className="text-xs font-black" style={{ color: '#f87171' }}>❌ {item.prob}</p>
                  <p className="text-xs" style={{ color: S.sub }}>{item.imp}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'analisis':
        return (
          <div className="space-y-4">
            {[
              { rol: '🛒 Clientes', color: '#ec4899', items: ['Ver menú digital escaneando un QR', 'Registrarse en programa de lealtad', 'Ver sellos acumulados y recompensas', 'Consultar el recetario', 'Dejar reseña del servicio'] },
              { rol: '👷 Empleados', color: '#06b6d4', items: ['Iniciar sesión con usuario y contraseña', 'Sellar tarjetas escaneando el QR del cliente', 'Consultar recetas con asistente de IA', 'Ver y actualizar estado de pedidos'] },
              { rol: '📊 Administradores', color: '#a78bfa', items: ['Analíticas de ventas del día, semana y mes', 'Gestionar menú (agregar, editar, desactivar)', 'Alertas automáticas de reseñas negativas', 'Configurar logo, colores y nombre del restaurante', 'Plano de mesas y reservaciones'] },
            ].map((g, i) => (
              <div key={i} className="rounded-xl p-4" style={{ border: `1px solid ${g.color}25`, backgroundColor: `${g.color}08` }}>
                <p className="text-sm font-black mb-2.5" style={{ color: g.color }}>{g.rol}</p>
                <ul className="space-y-1.5">
                  {g.items.map((item, j) => (
                    <li key={j} className="text-xs flex gap-2" style={{ color: S.sub }}>
                      <span style={{ color: g.color }}>✓</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )

      case 'diseno':
        return (
          <div className="space-y-5">
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--ad-border)' }}>
              {[
                { label: 'Clientes  /menu · /card · /recetas · /review', color: '#ec4899', icon: '👥' },
                { label: 'Empleados  /employee/*', color: '#06b6d4', icon: '👷' },
                { label: 'RESTA3  /resta3/*', color: '#00e676', icon: '🏪' },
                { label: 'Administrador  /admin/*', color: '#a78bfa', icon: '👑' },
                { label: 'API Propia  /api/*  →  Autenticación · Datos · IA', color: '#f59e0b', icon: '⚙️' },
                { label: 'Supabase  Base de datos en la nube', color: '#3b82f6', icon: '🗄️' },
              ].map((capa, i, arr) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--ad-border)' : 'none', backgroundColor: `${capa.color}08` }}>
                  <span className="text-lg">{capa.icon}</span>
                  <span className="text-xs font-bold" style={{ color: capa.color }}>{capa.label}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                ['🍽️','Menú Digital'],['💳','Tarjetas Lealtad'],['📦','Pedidos'],
                ['👨‍🍳','Recetario IA'],['⭐','Reseñas'],['📦','Inventario'],
                ['📊','Analíticas'],['📺','Señalización TV'],['🗓️','Reservaciones'],['⚙️','Configuración'],
              ].map(([ic, nm], i) => (
                <div key={i} className="rounded-xl p-3 flex items-center gap-2"
                  style={{ backgroundColor: S.bg, border: '1px solid var(--ad-border)' }}>
                  <span className="text-base">{ic}</span>
                  <div>
                    <p className="text-[10px] font-black" style={{ color: 'var(--ad-accent)' }}>M{String(i + 1).padStart(2, '0')}</p>
                    <p className="text-xs font-bold" style={{ color: S.text }}>{nm}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'elaboracion':
        return (
          <div className="space-y-6">
            {/* Stack */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                ['Interfaz','Next.js 16 + React 19','Velocidad y SEO'],
                ['Base de datos','Supabase (PostgreSQL)','Tiempo real, nube'],
                ['Inteligencia Artificial','Groq API · Llama 3','Respuestas rápidas'],
                ['Deploy','Vercel','HTTPS, CDN global, gratis'],
              ].map(([capa, tech, desc], i) => (
                <div key={i} className="rounded-xl p-3 flex justify-between items-start gap-2"
                  style={{ backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#10b981' }}>{capa}</p>
                    <p className="text-xs font-black mt-0.5" style={{ color: S.text }}>{tech}</p>
                  </div>
                  <p className="text-[10px]" style={{ color: S.sub }}>{desc}</p>
                </div>
              ))}
            </div>

            {/* Método de inserción por fases */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--ad-accent)' }}>
                Método de inserción por fases
              </p>
              <div className="space-y-3">
                {FASES.map(fase => {
                  const st  = faseEst[fase.num] ?? 'idle'
                  const msg = faseMsg[fase.num]
                  return (
                    <div key={fase.num} className="rounded-xl p-4 space-y-3"
                      style={{ border: `1px solid ${fase.color}30`, backgroundColor: `${fase.color}08` }}>
                      {/* Cabecera */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0"
                          style={{ backgroundColor: fase.color, color: '#000' }}>{fase.num}</div>
                        <div className="flex-1">
                          <p className="text-sm font-black" style={{ color: fase.color }}>{fase.icono} {fase.titulo}</p>
                          <p className="text-xs mt-0.5" style={{ color: S.sub }}>{fase.desc}</p>
                        </div>
                        {st === 'done' && (
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✓ Lista</span>
                        )}
                      </div>

                      {/* Mensaje resultado */}
                      {msg && (
                        <p className="text-xs px-3 py-2 rounded-lg font-medium"
                          style={{
                            backgroundColor: st === 'done' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: st === 'done' ? '#10b981' : '#f87171',
                          }}>{msg}</p>
                      )}

                      {/* Botones */}
                      <div className="flex flex-wrap gap-2">
                        {fase.num === 1 && (
                          <button onClick={() => activarFase(1)}
                            disabled={st === 'loading' || st === 'done'}
                            className="px-4 py-2 rounded-xl text-xs font-black disabled:opacity-50 transition-all hover:scale-105"
                            style={{ backgroundColor: fase.color, color: '#000' }}>
                            {st === 'loading' ? 'Cargando…' : st === 'done' ? '✓ Activada' : '⚡ Activar Fase 1'}
                          </button>
                        )}
                        <a href={fase.url} target="_blank" rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                          style={{ backgroundColor: `${fase.color}20`, color: fase.color, border: `1px solid ${fase.color}40` }}>
                          ↗ {fase.urlLabel}
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'implantacion':
        return (
          <div className="space-y-5">
            <div className="rounded-xl p-4 space-y-3"
              style={{ backgroundColor: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <p className="text-xs font-black" style={{ color: '#a78bfa' }}>Pipeline de despliegue</p>
              <div className="flex items-center gap-2 flex-wrap text-xs" style={{ color: S.sub }}>
                {['Código (VS Code)', '→', 'GitHub', '→', 'Vercel (build auto)', '→', 'Producción 24/7'].map((s, i) => (
                  <span key={i} className={s === '→' ? '' : 'px-2.5 py-1 rounded-lg font-bold'}
                    style={s !== '→' ? { backgroundColor: S.bg, color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' } : {}}>
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs" style={{ color: S.sub }}>
                Cada actualización llega a producción en menos de 2 minutos. Sin tiempo de inactividad.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--ad-accent)' }}>Resultados</p>
              {[
                ['Menú en papel, se mancha y pierde',       'Menú digital actualizable en segundos'],
                ['Sellos en tarjeta física que se olvidan', 'Tarjeta digital con QR, nunca se pierde'],
                ['Pedidos por voz o libreta',               'Sistema digital con estado en tiempo real'],
                ['Recetas solo en memoria del chef',        'Recetario con IA que guía paso a paso'],
                ['Sin saber qué platillo vende más',        'Analíticas por día, semana y platillo'],
                ['Reseñas negativas ignoradas',             'Alerta por correo al instante'],
              ].map(([antes, despues], i) => (
                <div key={i} className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(239,68,68,0.07)', color: '#f87171' }}>❌ {antes}</div>
                  <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(16,185,129,0.07)', color: '#10b981' }}>✅ {despues}</div>
                </div>
              ))}
            </div>
          </div>
        )

      default: return null
    }
  }

  return (
    <div className="min-h-screen md:ml-[240px] md:pt-16" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[900px] mx-auto p-4 space-y-4">

        {/* Encabezado */}
        <div className="pt-2 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0"
            style={{ backgroundColor: 'var(--ad-accent)', color: '#000' }}>S</div>
          <div>
            <h1 className="text-xl font-black" style={{ color: S.text }}>
              <span style={{ color: 'var(--ad-accent)' }}>SELEI</span> — Proyecto Restaurante
            </h1>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>
              Sistema Estratégico para la Elaboración e Implantación de Sistemas de Información
            </p>
            <p className="text-xs mt-1 font-bold" style={{ color: S.sub }}>
              Plataforma Digital para Restaurantes · Jesús Segundo · Junio 2026
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((t, i) => (
            <button key={t.id} onClick={() => setActiva(i)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all shrink-0"
              style={activa === i
                ? { backgroundColor: t.color, color: '#000' }
                : { backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
              {t.icono} {t.titulo}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: `${tab.color}18`, border: `2px solid ${tab.color}40` }}>
              {tab.icono}
            </div>
            <div>
              <h2 className="text-base font-black" style={{ color: S.text }}>{tab.titulo}</h2>
              <p className="text-xs" style={{ color: S.sub }}>
                {['Situación actual del restaurante','Qué necesita el sistema','Arquitectura y módulos','Cómo se construyó el sistema','Sistema en producción real'][activa]}
              </p>
            </div>
          </div>
          {renderContenido()}
        </div>

        {/* Navegación */}
        <div className="flex justify-between items-center pb-4">
          <button onClick={() => setActiva(a => Math.max(0, a - 1))} disabled={activa === 0}
            className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-30 transition-all"
            style={{ backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
            ← Anterior
          </button>
          <span className="text-xs" style={{ color: S.sub }}>{activa + 1} / {TABS.length}</span>
          <button onClick={() => setActiva(a => Math.min(TABS.length - 1, a + 1))} disabled={activa === TABS.length - 1}
            className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-30 transition-all"
            style={{ backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  )
}
