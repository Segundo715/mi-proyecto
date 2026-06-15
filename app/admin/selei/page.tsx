'use client'

import { useState } from 'react'
import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)',
  text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)',
}

const TABS = [
  { id: 'diagnostico',  icono: '🔍', titulo: 'Diagnóstico',  color: '#ef4444' },
  { id: 'analisis',     icono: '📋', titulo: 'Análisis',      color: '#f59e0b' },
  { id: 'diseno',       icono: '🏗️', titulo: 'Diseño',        color: '#06b6d4' },
  { id: 'elaboracion',  icono: '⚙️', titulo: 'Elaboración',   color: '#10b981' },
  { id: 'implantacion', icono: '🚀', titulo: 'Implantación',  color: '#a78bfa' },
]

// Cada módulo se revela uno por uno durante la presentación
interface Modulo {
  id: number
  icono: string
  titulo: string
  grupo: 'usuario' | 'empleado' | 'admin'
  rol: string
  rolIcon: string
  color: string
  desc: string
  url: string
  urlLabel: string
  seed?: () => Promise<{ ok: boolean; created?: number }>
}

const GRUPOS = {
  usuario:  { label: 'Usuario / Cliente',  icon: '👥', color: '#ec4899' },
  empleado: { label: 'Empleado',           icon: '👷', color: '#38bdf8' },
  admin:    { label: 'Administrador',      icon: '👑', color: '#a78bfa' },
}

const MODULOS: Modulo[] = [
  // ── Usuarios / Clientes ──────────────────────────────────
  {
    id: 1, icono: '🍽️', titulo: 'Menú Digital',
    grupo: 'usuario', rol: 'Usuario / Cliente', rolIcon: '👥', color: '#ec4899',
    desc: 'El cliente escanea el QR y ve el menú completo desde su teléfono. Sin instalar ninguna app.',
    url: '/menu', urlLabel: 'Ver menú como cliente',
    seed: () => fetch('/api/menu/seed', { method: 'POST' }).then(r => r.json()),
  },
  {
    id: 2, icono: '⭐', titulo: 'Reseñas',
    grupo: 'usuario', rol: 'Usuario / Cliente', rolIcon: '👥', color: '#f59e0b',
    desc: 'El cliente deja una reseña al terminar su visita. Las negativas generan alerta por email al dueño.',
    url: '/review', urlLabel: 'Dejar reseña',
  },
  {
    id: 3, icono: '💳', titulo: 'Tarjetas de Lealtad',
    grupo: 'usuario', rol: 'Usuario / Cliente', rolIcon: '👥', color: '#06b6d4',
    desc: 'El cliente acumula sellos digitales. Al completar los sellos, gana su recompensa automáticamente.',
    url: '/card', urlLabel: 'Ver mi tarjeta',
  },
  // ── Empleados ────────────────────────────────────────────
  {
    id: 4, icono: '📖', titulo: 'Recetario con IA',
    grupo: 'empleado', rol: 'Empleado', rolIcon: '👷', color: '#10b981',
    desc: 'El empleado consulta recetas paso a paso. El asistente de IA le guía en ingredientes y preparación.',
    url: '/employee/recipes', urlLabel: 'Ver recetario del empleado',
  },
  {
    id: 5, icono: '🛎️', titulo: 'Gestión de Pedidos',
    grupo: 'empleado', rol: 'Empleado', rolIcon: '👷', color: '#38bdf8',
    desc: 'Los pedidos avanzan en tiempo real: pendiente → preparando → listo → entregado.',
    url: '/employee', urlLabel: 'Panel de empleado',
  },
  {
    id: 6, icono: '💠', titulo: 'Sellar Tarjetas',
    grupo: 'empleado', rol: 'Empleado', rolIcon: '👷', color: '#818cf8',
    desc: 'El empleado escanea el QR del cliente con la cámara para agregar un sello a su tarjeta digital.',
    url: '/employee', urlLabel: 'Panel de empleado',
  },
  // ── Administrador ────────────────────────────────────────
  {
    id: 7, icono: '📊', titulo: 'Analíticas y Ventas',
    grupo: 'admin', rol: 'Administrador', rolIcon: '👑', color: '#a78bfa',
    desc: 'El dueño ve ventas del día, semana y mes. Identifica los platillos más populares.',
    url: '/admin/analytics', urlLabel: 'Ver analíticas',
  },
  {
    id: 8, icono: '⚙️', titulo: 'Configuración General',
    grupo: 'admin', rol: 'Administrador', rolIcon: '👑', color: '#c084fc',
    desc: 'Logo, colores, nombre del restaurante y todos los módulos desde un solo panel.',
    url: '/admin', urlLabel: 'Abrir panel admin',
  },
]

export default function SeleiPage() {
  const [activa,    setActiva]    = useState(0)
  // cuántos módulos están visibles (empieza en 0 = ninguno revelado)
  const [revelados, setRevelados] = useState(0)
  const [sembrando, setSembrando] = useState(false)
  const [seedMsg,   setSeedMsg]   = useState('')

  async function revelarSiguiente() {
    const siguiente = revelados + 1
    if (siguiente > MODULOS.length) return

    const modulo = MODULOS[siguiente - 1]

    // Si el módulo tiene seed (solo menú), lo ejecuta primero
    if (modulo.seed) {
      setSembrando(true)
      setSeedMsg('')
      try {
        const res = await modulo.seed()
        setSeedMsg(res.created === 0 ? 'Datos ya cargados' : `${res.created} platillos insertados`)
      } catch {
        setSeedMsg('Error al cargar datos')
      }
      setSembrando(false)
    }

    setRevelados(siguiente)
  }

  function reiniciar() { setRevelados(0); setSeedMsg('') }

  const tab = TABS[activa]
  const modulosVisibles = MODULOS.slice(0, revelados)
  const hayMas = revelados < MODULOS.length

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
                ['Menú solo en papel',       'Clientes no pueden verlo desde su teléfono'],
                ['Sin sistema de lealtad',   'Se pierden clientes frecuentes, sin registro'],
                ['Pedidos por libreta',      'Errores, pedidos perdidos, sin trazabilidad'],
                ['Recetas solo en memoria',  'Si falta el chef, la producción se para'],
                ['Sin analíticas de ventas', 'El dueño no sabe qué platillos venden más'],
                ['Reseñas ignoradas',        'La reputación cae sin que el dueño lo note'],
              ].map(([prob, imp], i) => (
                <div key={i} className="rounded-xl p-3.5 space-y-1"
                  style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <p className="text-xs font-black" style={{ color: '#f87171' }}>❌ {prob}</p>
                  <p className="text-xs" style={{ color: S.sub }}>{imp}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'analisis':
        return (
          <div className="space-y-4">
            {[
              { rol: '👥 Usuarios / Clientes', color: '#ec4899', items: ['Ver menú digital escaneando un QR','Registrarse en programa de lealtad','Ver sellos acumulados y recompensas','Consultar el recetario','Dejar reseña del servicio'] },
              { rol: '👷 Empleados', color: '#06b6d4', items: ['Iniciar sesión con usuario y contraseña','Sellar tarjetas escaneando QR del cliente','Consultar recetas con asistente de IA','Ver y actualizar estado de pedidos'] },
              { rol: '👑 Administradores', color: '#a78bfa', items: ['Analíticas de ventas del día, semana y mes','Gestionar menú (agregar, editar, desactivar)','Alertas automáticas de reseñas negativas','Configurar logo, colores y nombre','Plano de mesas y reservaciones'] },
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
                { label: 'API Propia  /api/*', color: '#f59e0b', icon: '⚙️' },
                { label: 'Supabase — Base de datos en la nube', color: '#3b82f6', icon: '🗄️' },
              ].map((c, i, arr) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--ad-border)' : 'none', backgroundColor: `${c.color}08` }}>
                  <span className="text-lg">{c.icon}</span>
                  <span className="text-xs font-bold" style={{ color: c.color }}>{c.label}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[['🍽️','Menú Digital'],['💳','Lealtad'],['📦','Pedidos'],['👨‍🍳','Recetario IA'],['⭐','Reseñas'],['📦','Inventario'],['📊','Analíticas'],['📺','TV'],['🗓️','Reservaciones'],['⚙️','Config']].map(([ic, nm], i) => (
                <div key={i} className="rounded-xl p-3 flex items-center gap-2"
                  style={{ backgroundColor: S.bg, border: '1px solid var(--ad-border)' }}>
                  <span>{ic}</span>
                  <div>
                    <p className="text-[10px] font-black" style={{ color: 'var(--ad-accent)' }}>M{String(i+1).padStart(2,'0')}</p>
                    <p className="text-xs font-bold" style={{ color: S.text }}>{nm}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'elaboracion':
        return (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed" style={{ color: S.sub }}>
              El sistema se presenta módulo por módulo. Empieza con el menú y activa cada función cuando el público esté listo.
            </p>

            {/* Módulos revelados */}
            <div className="space-y-3">
              {modulosVisibles.map((mod, idx) => {
                const g = GRUPOS[mod.grupo]
                const anteriorGrupo = idx > 0 ? modulosVisibles[idx - 1].grupo : null
                const esNuevoGrupo  = mod.grupo !== anteriorGrupo
                return (
                <div key={mod.id}>
                  {/* Separador de grupo cuando cambia el rol */}
                  {esNuevoGrupo && (
                    <div className="flex items-center gap-2 mb-2 mt-1">
                      <span className="text-sm">{g.icon}</span>
                      <p className="text-xs font-black uppercase tracking-widest" style={{ color: g.color }}>{g.label}</p>
                      <div className="flex-1 h-px" style={{ backgroundColor: `${g.color}30` }} />
                    </div>
                  )}
                  <div className="rounded-xl p-4 flex items-start gap-3"
                    style={{ border: `1px solid ${mod.color}35`, backgroundColor: `${mod.color}08` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: mod.color, color: '#fff' }}>{mod.icono}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-black" style={{ color: mod.color }}>{mod.titulo}</p>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${mod.color}20`, color: mod.color }}>
                          {mod.rolIcon} {mod.rol}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                          ✓ Activo
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: S.sub }}>{mod.desc}</p>
                      {idx === 0 && seedMsg && (
                        <p className="text-[11px] mt-1 font-medium" style={{ color: '#10b981' }}>📦 {seedMsg}</p>
                      )}
                      <a href={mod.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105"
                        style={{ backgroundColor: `${mod.color}20`, color: mod.color, border: `1px solid ${mod.color}40` }}>
                        ↗ {mod.urlLabel}
                      </a>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>

            {/* Módulos aún ocultos — se muestran como bloqueados */}
            {revelados < MODULOS.length && (
              <div className="space-y-2">
                {MODULOS.slice(revelados).map(mod => (
                  <div key={mod.id} className="rounded-xl px-4 py-3 flex items-center gap-3 opacity-30"
                    style={{ border: '1px solid var(--ad-border)', backgroundColor: S.bg }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                      style={{ backgroundColor: S.card }}>🔒</div>
                    <div>
                      <p className="text-xs font-black" style={{ color: S.sub }}>{mod.icono} {mod.titulo}</p>
                      <p className="text-[10px]" style={{ color: S.sub }}>{mod.rolIcon} {mod.rol}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botones de control */}
            <div className="flex gap-3 pt-2">
              {hayMas ? (
                <button onClick={revelarSiguiente} disabled={sembrando}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-black disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-95"
                  style={{ backgroundColor: 'var(--ad-accent)', color: '#000' }}>
                  {sembrando
                    ? '⏳ Cargando datos…'
                    : revelados === 0
                      ? `⚡ Iniciar — Mostrar ${MODULOS[0].titulo}`
                      : `➕ Mostrar siguiente: ${MODULOS[revelados].titulo}`}
                </button>
              ) : (
                <div className="flex-1 py-3.5 rounded-2xl text-sm font-black text-center"
                  style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                  ✅ Todos los módulos presentados
                </div>
              )}
              {revelados > 0 && (
                <button onClick={reiniciar}
                  className="px-4 py-3.5 rounded-2xl text-sm font-bold transition-all"
                  style={{ backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
                  ↺ Reiniciar
                </button>
              )}
            </div>
          </div>
        )

      case 'implantacion':
        return (
          <div className="space-y-5">
            <div className="rounded-xl p-4 space-y-3"
              style={{ backgroundColor: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <p className="text-xs font-black" style={{ color: '#a78bfa' }}>Pipeline de despliegue</p>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {['Código (VS Code)','→','GitHub','→','Vercel (build auto)','→','Producción 24/7'].map((s, i) => (
                  <span key={i} className={s === '→' ? '' : 'px-2.5 py-1 rounded-lg font-bold'}
                    style={s !== '→' ? { backgroundColor: S.bg, color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' } : { color: S.sub }}>
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs" style={{ color: S.sub }}>Cada actualización llega a producción en menos de 2 minutos. Sin tiempo de inactividad.</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--ad-accent)' }}>Antes vs Después</p>
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
                {['Situación actual del restaurante','Qué necesita el sistema','Arquitectura y módulos','Demostración por módulos','Sistema en producción'][activa]}
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
