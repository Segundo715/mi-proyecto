'use client'

import { useState } from 'react'
import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)',
  text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)',
}

const SECCIONES = [
  {
    id: 'diagnostico',
    letra: 'S',
    titulo: 'Diagnóstico',
    subtitulo: 'Situación actual del restaurante',
    icono: '🔍',
    color: '#ef4444',
    contenido: (
      <div className="space-y-5">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ad-sub)' }}>
          Los restaurantes pequeños y medianos enfrentan problemas operativos que afectan sus ventas y la experiencia del cliente.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { prob: 'Menú solo en papel', imp: 'Clientes no pueden verlo desde su teléfono' },
            { prob: 'Sin sistema de lealtad', imp: 'Se pierden clientes frecuentes, sin registro' },
            { prob: 'Pedidos por libreta', imp: 'Errores, pedidos perdidos, sin trazabilidad' },
            { prob: 'Recetas solo en memoria', imp: 'Si falta el chef, la producción se para' },
            { prob: 'Sin analíticas de ventas', imp: 'El dueño no sabe qué platillos venden más' },
            { prob: 'Reseñas ignoradas', imp: 'La reputación cae sin que el dueño lo note' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl p-3.5 space-y-1"
              style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p className="text-xs font-black" style={{ color: '#f87171' }}>❌ {item.prob}</p>
              <p className="text-xs" style={{ color: 'var(--ad-sub)' }}>{item.imp}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'analisis',
    letra: 'E',
    titulo: 'Análisis de Requerimientos',
    subtitulo: 'Qué necesita el sistema',
    icono: '📋',
    color: '#f59e0b',
    contenido: (
      <div className="space-y-5">
        {[
          {
            rol: '🛒 Para Clientes', color: '#ec4899',
            items: [
              'Ver el menú digital desde el teléfono escaneando un QR',
              'Registrarse en el programa de lealtad con nombre y teléfono',
              'Ver sus sellos acumulados y cuándo ganan su recompensa',
              'Consultar el recetario del restaurante',
              'Dejar una reseña del servicio',
            ],
          },
          {
            rol: '👷 Para Empleados', color: '#06b6d4',
            items: [
              'Iniciar sesión con usuario y contraseña',
              'Sellar tarjetas de lealtad escaneando el QR del cliente',
              'Consultar recetas paso a paso con asistente de IA',
              'Ver y actualizar el estado de los pedidos',
            ],
          },
          {
            rol: '📊 Para Administradores', color: '#a78bfa',
            items: [
              'Ver analíticas de ventas del día, semana y mes',
              'Gestionar el menú (agregar, editar, desactivar platillos)',
              'Recibir alertas automáticas de reseñas negativas',
              'Configurar logo, colores y nombre del restaurante',
              'Ver plano de mesas y gestionar reservaciones',
            ],
          },
        ].map((grupo, i) => (
          <div key={i} className="rounded-xl p-4" style={{ border: `1px solid ${grupo.color}25`, backgroundColor: `${grupo.color}08` }}>
            <p className="text-sm font-black mb-2.5" style={{ color: grupo.color }}>{grupo.rol}</p>
            <ul className="space-y-1.5">
              {grupo.items.map((item, j) => (
                <li key={j} className="text-xs flex gap-2" style={{ color: 'var(--ad-sub)' }}>
                  <span style={{ color: grupo.color }}>✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'diseno',
    letra: 'L',
    titulo: 'Diseño del Sistema',
    subtitulo: 'Arquitectura y módulos',
    icono: '🏗️',
    color: '#06b6d4',
    contenido: (
      <div className="space-y-5">
        {/* Arquitectura visual */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--ad-border)' }}>
          {[
            { label: 'Clientes  /menu · /card · /recetas · /review', color: '#ec4899', icon: '👥' },
            { label: 'Empleados  /employee/*', color: '#06b6d4', icon: '👷' },
            { label: 'RESTA3  /resta3/*', color: '#00e676', icon: '🏪' },
            { label: 'Administrador  /admin/*', color: '#a78bfa', icon: '👑' },
            { label: 'API Propia  /api/*  →  Autenticación · Datos · IA', color: '#f59e0b', icon: '⚙️' },
            { label: 'Supabase  Base de datos en la nube', color: '#3b82f6', icon: '🗄️' },
          ].map((capa, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < 5 ? '1px solid var(--ad-border)' : 'none', backgroundColor: `${capa.color}08` }}>
              <span className="text-lg">{capa.icon}</span>
              <span className="text-xs font-bold" style={{ color: capa.color }}>{capa.label}</span>
            </div>
          ))}
        </div>
        {/* Módulos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { n: '01', m: 'Menú Digital', i: '🍽️' },
            { n: '02', m: 'Tarjetas Lealtad', i: '💳' },
            { n: '03', m: 'Pedidos', i: '📦' },
            { n: '04', m: 'Recetario IA', i: '👨‍🍳' },
            { n: '05', m: 'Reseñas', i: '⭐' },
            { n: '06', m: 'Inventario', i: '📦' },
            { n: '07', m: 'Analíticas', i: '📊' },
            { n: '08', m: 'Señalización TV', i: '📺' },
            { n: '09', m: 'Reservaciones', i: '🗓️' },
            { n: '10', m: 'Configuración', i: '⚙️' },
          ].map(item => (
            <div key={item.n} className="rounded-xl p-3 flex items-center gap-2"
              style={{ backgroundColor: 'var(--ad-bg)', border: '1px solid var(--ad-border)' }}>
              <span className="text-base">{item.i}</span>
              <div>
                <p className="text-[10px] font-black" style={{ color: 'var(--ad-accent)' }}>M{item.n}</p>
                <p className="text-xs font-bold" style={{ color: 'var(--ad-text)' }}>{item.m}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'elaboracion',
    letra: 'E',
    titulo: 'Elaboración',
    subtitulo: 'Cómo se construyó el sistema',
    icono: '⚙️',
    color: '#10b981',
    contenido: (
      <div className="space-y-5">
        {/* Stack */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--ad-accent)' }}>Tecnologías</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { capa: 'Interfaz', tech: 'Next.js 16 + React 19', desc: 'Velocidad y SEO' },
              { capa: 'Estilos', tech: 'Tailwind CSS 4', desc: 'Diseño responsivo' },
              { capa: 'Lenguaje', tech: 'TypeScript', desc: 'Menos errores' },
              { capa: 'Base de datos', tech: 'Supabase (PostgreSQL)', desc: 'Tiempo real, nube' },
              { capa: 'Inteligencia Artificial', tech: 'Groq API · Llama 3', desc: 'Respuestas rápidas' },
              { capa: 'Deploy', tech: 'Vercel', desc: 'HTTPS, CDN global' },
            ].map((t, i) => (
              <div key={i} className="rounded-xl p-3 flex justify-between items-start gap-2"
                style={{ backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#10b981' }}>{t.capa}</p>
                  <p className="text-xs font-black mt-0.5" style={{ color: 'var(--ad-text)' }}>{t.tech}</p>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--ad-sub)' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Fases de elaboración */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--ad-accent)' }}>Método de inserción por fases</p>
          <div className="space-y-2">
            {[
              { f: 1, t: 'Menú Digital', d: '8 platillos en 5 categorías, QR para clientes', c: '#f59e0b' },
              { f: 2, t: 'Recetario y Empleados', d: 'Recetas paso a paso + asistente de IA', c: '#10b981' },
              { f: 3, t: 'Sistema Completo', d: 'Analíticas, lealtad, inventario, reservaciones', c: '#a78bfa' },
            ].map(fase => (
              <div key={fase.f} className="rounded-xl p-3.5 flex items-center gap-3"
                style={{ border: `1px solid ${fase.c}30`, backgroundColor: `${fase.c}08` }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                  style={{ backgroundColor: fase.c, color: '#000' }}>{fase.f}</div>
                <div>
                  <p className="text-xs font-black" style={{ color: fase.c }}>{fase.t}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ad-sub)' }}>{fase.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'implantacion',
    letra: 'I',
    titulo: 'Implantación y Resultados',
    subtitulo: 'Sistema en producción real',
    icono: '🚀',
    color: '#a78bfa',
    contenido: (
      <div className="space-y-5">
        {/* Deploy pipeline */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>
          <p className="text-xs font-black mb-3" style={{ color: '#a78bfa' }}>Pipeline de despliegue</p>
          <div className="flex items-center gap-2 flex-wrap text-xs" style={{ color: 'var(--ad-sub)' }}>
            {['Código (VS Code)', '→', 'GitHub (repositorio)', '→', 'Vercel (build auto)', '→', 'Producción 24/7'].map((s, i) => (
              <span key={i} className={s === '→' ? '' : 'px-2.5 py-1 rounded-lg font-bold'}
                style={s !== '→' ? { backgroundColor: 'var(--ad-bg)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' } : {}}>
                {s}
              </span>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--ad-sub)' }}>
            Cada actualización tarda menos de 2 minutos en llegar a producción. Sin tiempo de inactividad.
          </p>
        </div>

        {/* Antes vs Después */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--ad-accent)' }}>Resultados</p>
          <div className="space-y-2">
            {[
              { antes: 'Menú en papel, se mancha y pierde', despues: 'Menú digital actualizable en segundos' },
              { antes: 'Sellos en tarjeta física que se olvidan', despues: 'Tarjeta digital con QR, nunca se pierde' },
              { antes: 'Pedidos por voz o libreta', despues: 'Sistema digital con estado en tiempo real' },
              { antes: 'Recetas solo en la memoria del chef', despues: 'Recetario con IA que guía paso a paso' },
              { antes: 'Sin saber qué platillo vende más', despues: 'Analíticas por día, semana y platillo' },
              { antes: 'Reseñas negativas ignoradas', despues: 'Alerta por correo al instante' },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.07)', color: '#f87171' }}>
                  ❌ {item.antes}
                </div>
                <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: 'rgba(16,185,129,0.07)', color: '#10b981' }}>
                  ✅ {item.despues}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón demo */}
        <a href="/admin/demo" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-black transition-all hover:scale-105"
          style={{ backgroundColor: 'var(--ad-accent)', color: '#000' }}>
          ⚡ Ir a la demostración en vivo →
        </a>
      </div>
    ),
  },
]

export default function SeleiPage() {
  const [activa, setActiva] = useState(0)
  const seccion = SECCIONES[activa]

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

        {/* Tabs de navegación */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {SECCIONES.map((sec, i) => (
            <button key={sec.id} onClick={() => setActiva(i)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all shrink-0"
              style={activa === i
                ? { backgroundColor: sec.color, color: '#000' }
                : { backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
              <span>{sec.icono}</span>
              <span>{sec.titulo}</span>
            </button>
          ))}
        </div>

        {/* Contenido de la sección activa */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: `${seccion.color}18`, border: `2px solid ${seccion.color}40` }}>
              {seccion.icono}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${seccion.color}20`, color: seccion.color }}>
                  {seccion.letra}
                </span>
              </div>
              <h2 className="text-base font-black" style={{ color: S.text }}>{seccion.titulo}</h2>
              <p className="text-xs" style={{ color: S.sub }}>{seccion.subtitulo}</p>
            </div>
          </div>
          {seccion.contenido}
        </div>

        {/* Navegación entre secciones */}
        <div className="flex justify-between items-center pb-4">
          <button onClick={() => setActiva(a => Math.max(0, a - 1))} disabled={activa === 0}
            className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-30 transition-all"
            style={{ backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
            ← Anterior
          </button>
          <span className="text-xs" style={{ color: S.sub }}>
            {activa + 1} / {SECCIONES.length}
          </span>
          <button onClick={() => setActiva(a => Math.min(SECCIONES.length - 1, a + 1))} disabled={activa === SECCIONES.length - 1}
            className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-30 transition-all"
            style={{ backgroundColor: S.card, color: S.sub, border: `1px solid ${S.border}` }}>
            Siguiente →
          </button>
        </div>

      </div>
    </div>
  )
}
