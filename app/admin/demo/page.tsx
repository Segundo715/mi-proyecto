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
}

type St = 'idle' | 'loading' | 'done' | 'error'

const NAV_BASE = {
  bg: '#0d0d0d', border: '#1a1a1a', accent: '#B90F45',
  inactive: '#6b7280', radius: 9999, showLogout: true,
}
const NAV_FASES = {
  1: { ...NAV_BASE, tabs: [{ id: 'menu',   label: 'Menú',    href: '/menu',   icon: '' }] },
  2: { ...NAV_BASE, tabs: [{ id: 'menu',   label: 'Menú',    href: '/menu',   icon: '' }, { id: 'card', label: 'Tarjeta', href: '/card', icon: '' }] },
  3: { ...NAV_BASE, tabs: [{ id: 'menu',   label: 'Menú',    href: '/menu',   icon: '' }, { id: 'card', label: 'Tarjeta', href: '/card', icon: '' }, { id: 'review', label: 'Reseñas', href: '/review', icon: '' }] },
}

async function setSetting(key: string, value: string) {
  const r = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) })
  if (!r.ok) throw new Error('No autorizado')
}

// ── Acciones de cada botón ───────────────────────────────────────────────────

const ACCIONES: Record<string, () => Promise<string>> = {
  fase1: async () => {
    await setSetting('customer_nav', JSON.stringify(NAV_FASES[1]))
    return 'Nav actualizada — solo Menú visible'
  },
  fase2: async () => {
    await setSetting('customer_nav', JSON.stringify(NAV_FASES[2]))
    return 'Nav actualizada — Menú + Tarjeta visibles'
  },
  fase3: async () => {
    await setSetting('customer_nav', JSON.stringify(NAV_FASES[3]))
    return 'Nav actualizada — Menú + Tarjeta + Reseñas visibles'
  },
  menu: async () => {
    const r = await fetch('/api/menu/seed', { method: 'POST' }).then(r => r.json())
    return r.created > 0 ? `${r.created} platillos insertados` : `Menú ya cargado (${r.skipped} platillos)`
  },
  rec: async () => {
    const recetas = [
      { name: 'Hamburguesa Clásica', ingredients: [{ name: 'Carne de res molida', quantity: '180', unit: 'g' }, { name: 'Pan para hamburguesa', quantity: '1', unit: 'pieza' }, { name: 'Queso cheddar', quantity: '1', unit: 'rebanada' }], steps: [{ step: 1, description: 'Forma la hamburguesa y sazona con sal y pimienta.' }, { step: 2, description: 'Cocina en comal caliente 3 min por lado.' }, { step: 3, description: 'Coloca el queso al final 1 min para que se derrita.' }, { step: 4, description: 'Tuesta el pan 1 min y unta el aderezo.' }, { step: 5, description: 'Arma: pan, aderezo, carne con queso, lechuga, jitomate, tapa.' }] },
      { name: 'Pizza Margherita', ingredients: [{ name: 'Masa de pizza', quantity: '250', unit: 'g' }, { name: 'Salsa de tomate', quantity: '4', unit: 'cdas' }, { name: 'Mozzarella fresca', quantity: '150', unit: 'g' }], steps: [{ step: 1, description: 'Precalienta el horno a 250 °C.' }, { step: 2, description: 'Estira la masa hasta 30 cm y cubre con salsa.' }, { step: 3, description: 'Distribuye la mozzarella en trozos.' }, { step: 4, description: 'Hornea 9 min hasta que el borde dore.' }, { step: 5, description: 'Agrega albahaca fresca al sacar del horno.' }] },
    ]
    let creadas = 0
    for (const r of recetas) {
      const res = await fetch('/api/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) })
      if (res.ok) creadas++
    }
    return creadas > 0 ? `${creadas} recetas insertadas` : 'Recetas ya cargadas'
  },
  ped: async () => {
    const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName: 'Mesa 4', tableNumber: '4', items: [{ name: 'Hamburguesa Clásica', quantity: 2, price: 120 }, { name: 'Café Americano', quantity: 2, price: 45 }], total: 330, notes: 'Sin cebolla' }) }).then(r => r.json())
    return r.id ? 'Pedido Mesa 4 — pendiente $330' : 'Pedido ya existe'
  },
  res: async () => {
    const resenas = [
      { customerName: 'Ana Rodríguez', rating: 5, comment: 'Excelente servicio, la hamburguesa estaba perfecta.' },
      { customerName: 'Jorge Pérez',   rating: 2, comment: 'La pizza llegó fría y el servicio estuvo muy lento.' },
    ]
    let ok = 0
    for (const r of resenas) {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) })
      if (res.ok) ok++
    }
    return ok > 0 ? `${ok} reseñas insertadas (1 negativa → alerta roja)` : 'Reseñas ya cargadas'
  },
  inv: async () => {
    const items = [
      { name: 'Carne de res molida', category: 'Carnes', stock: 12, minStock: 5,  unit: 'kg', cost: 180 },
      { name: 'Tocino',              category: 'Carnes', stock: 1,  minStock: 3,  unit: 'kg', cost: 210 },
      { name: 'Fresas frescas',      category: 'Frutas', stock: 1,  minStock: 4,  unit: 'kg', cost: 95  },
    ]
    let ok = 0
    for (const i of items) {
      const res = await fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(i) })
      if (res.ok) ok++
    }
    return ok > 0 ? `${ok} artículos — Tocino y Fresas con alerta de stock bajo` : 'Inventario ya cargado'
  },
  tv: async () => {
    const slides = [
      { title: '🍔 Hamburguesa BBQ',  subtitle: 'Carne de res, tocino crujiente y salsa ahumada', price: '$145', isOffer: true, active: true },
      { title: '🍕 Pizza del Día',    subtitle: 'Margherita con mozzarella fresca y albahaca',    price: '$140', isOffer: true, active: true },
      { title: '☕ Café + Postre',    subtitle: 'Café americano + cheesecake de fresa',           price: '$120', isOffer: true, active: true },
    ]
    let ok = 0
    for (const s of slides) {
      const res = await fetch('/api/tv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
      if (res.ok) ok++
    }
    return ok > 0 ? `${ok} slides para pantalla TV` : 'Slides ya cargados'
  },
  leal: async () => {
    const r = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'María García', phone: '6641234567', age: 28 }) }).then(r => r.json())
    return r.id ? 'María García — cliente demo creada' : 'Cliente ya existe'
  },
}

// ── Secciones de la página ───────────────────────────────────────────────────

interface Boton {
  id:    string
  label: string
  desc:  string
  href?: string
  color: string
}

// Links directos del admin (sin acción, solo navegación)
interface Link { label: string; href: string; desc: string }

const ADMIN_LINKS: Link[] = [
  { label: '📊 Dashboard',      href: '/admin',                  desc: 'Resumen general del negocio' },
  { label: '📈 Analíticas',     href: '/admin/analytics',        desc: 'Ventas por día y semana' },
  { label: '⭐ Reseñas',        href: '/admin/reviews',          desc: 'Buenas y malas — alerta roja' },
  { label: '📦 Inventario',     href: '/admin/inventario',       desc: 'Stock bajo en Tocino y Fresas' },
  { label: '🍽️ Gestión Menú',  href: '/admin/menu',             desc: 'Agregar, editar y desactivar platillos' },
  { label: '🃏 Tarjetas',       href: '/admin/tarjetas',         desc: 'Historial de lealtad de clientes' },
  { label: '👥 Clientes CRM',   href: '/admin/customers',        desc: 'Base de datos de clientes registrados' },
  { label: '📺 Pantalla TV',    href: '/admin/tv',               desc: 'Señalización digital del negocio' },
  { label: '🪑 Reservaciones',  href: '/admin/reservaciones',    desc: 'Plano de mesas y turnos' },
  { label: '⚙️ Configuración',  href: '/admin/configuracion',    desc: 'Logo, colores y nombre del restaurante' },
]

const SECCIONES = [
  {
    titulo: '👥 Cliente — Visibilidad por fases',
    sub:    'Controla qué tabs aparecen en el teléfono del cliente en tiempo real',
    botones: [
      { id: 'fase1', label: '① Solo Menú',             desc: 'Oculta Tarjeta y Reseñas',         href: '/menu',   color: '#f59e0b' },
      { id: 'fase2', label: '② Menú + Tarjeta',        desc: 'Agrega tarjeta de lealtad',        href: '/card',   color: '#10b981' },
      { id: 'fase3', label: '③ Todo visible',           desc: 'Agrega reseñas — vista completa', href: '/review', color: '#a78bfa' },
    ] as Boton[],
  },
  {
    titulo: '👷 Empleado — Datos de demo',
    sub:    'Inserta datos para mostrar el panel del empleado',
    botones: [
      { id: 'menu', label: '🍽️ Menú',          desc: '4 platillos en 4 categorías',          href: '/menu',                color: '#f59e0b' },
      { id: 'rec',  label: '📖 Recetas',        desc: '2 recetas con pasos para la IA',       href: '/employee/recipes',    color: '#06b6d4' },
      { id: 'ped',  label: '📦 Pedido activo',  desc: 'Mesa 4 — pendiente $330',              href: '/employee/orders',     color: '#8b5cf6' },
      { id: 'leal', label: '🃏 Lealtad',        desc: 'Cliente demo con 4 sellos',            href: '/employee',            color: '#f97316' },
    ] as Boton[],
  },
  {
    titulo: '👑 Admin — Datos de demo',
    sub:    'Inserta datos para mostrar el panel de administrador',
    botones: [
      { id: 'res',  label: '⭐ Reseñas',        desc: '1 buena + 1 mala (alerta roja)',       href: '/admin/reviews',       color: '#ec4899' },
      { id: 'inv',  label: '📊 Inventario',     desc: 'Tocino y Fresas con stock bajo',       href: '/admin/inventario',    color: '#ef4444' },
      { id: 'tv',   label: '📺 Pantalla TV',    desc: '3 slides de ofertas del día',          href: '/admin/tv',            color: '#14b8a6' },
    ] as Boton[],
  },
]

export default function DemoPage() {
  const [estados, setEstados] = useState<Record<string, St>>({})
  const [msgs,    setMsgs]    = useState<Record<string, string>>({})

  async function ejecutar(id: string) {
    setEstados(p => ({ ...p, [id]: 'loading' }))
    try {
      const msg = await ACCIONES[id]()
      setMsgs(p => ({ ...p, [id]: msg }))
      setEstados(p => ({ ...p, [id]: 'done' }))
    } catch (e: unknown) {
      setMsgs(p => ({ ...p, [id]: e instanceof Error ? e.message : 'Error' }))
      setEstados(p => ({ ...p, [id]: 'error' }))
    }
  }

  return (
    <div className="min-h-screen md:ml-[240px] md:pt-16" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[860px] mx-auto p-4 space-y-8">

        {/* Header */}
        <div className="pt-2">
          <h1 className="text-xl font-black" style={{ color: S.text }}>
            Control de <span style={{ color: S.accent }}>Demo</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: S.sub }}>
            Activa módulos y controla lo que ve cada audiencia durante la presentación.
          </p>
        </div>

        {SECCIONES.map(sec => (
          <div key={sec.titulo}>
            <div className="mb-3">
              <h2 className="text-base font-black" style={{ color: S.text }}>{sec.titulo}</h2>
              <p className="text-xs" style={{ color: S.sub }}>{sec.sub}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sec.botones.map(b => {
                const st = estados[b.id] ?? 'idle'
                return (
                  <div key={b.id} className="rounded-2xl p-4 flex flex-col gap-2"
                    style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-black" style={{ color: S.text }}>{b.label}</p>
                        <p className="text-xs" style={{ color: S.sub }}>{b.desc}</p>
                      </div>
                      {st === 'done' && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                          ✓ Listo
                        </span>
                      )}
                    </div>

                    {msgs[b.id] && (
                      <p className="text-xs px-2 py-1.5 rounded-lg"
                        style={{
                          backgroundColor: st === 'done' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: st === 'done' ? '#10b981' : '#f87171',
                        }}>
                        {msgs[b.id]}
                      </p>
                    )}

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => ejecutar(b.id)}
                        disabled={st === 'loading'}
                        className="flex-1 py-2 rounded-xl text-xs font-black disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                        style={{ backgroundColor: b.color, color: '#000' }}>
                        {st === 'loading' ? 'Cargando…' : st === 'done' ? '↺ Repetir' : '⚡ Activar'}
                      </button>
                      {b.href && (
                        <a href={b.href} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                          style={{ backgroundColor: S.bg, color: S.sub, border: `1px solid ${S.border}` }}>
                          Ver ↗
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Admin — accesos directos */}
        <div>
          <div className="mb-3">
            <h2 className="text-base font-black" style={{ color: S.text }}>👑 Admin — Accesos directos</h2>
            <p className="text-xs" style={{ color: S.sub }}>Abre cada sección del panel de administrador para mostrarla</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ADMIN_LINKS.map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                className="rounded-xl p-3 flex flex-col gap-0.5 transition-all hover:scale-[1.02]"
                style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <span className="text-sm font-black" style={{ color: S.text }}>{l.label} ↗</span>
                <span className="text-[11px]" style={{ color: S.sub }}>{l.desc}</span>
              </a>
            ))}
          </div>
        </div>

        <p className="text-xs text-center pb-4" style={{ color: S.sub }}>
          Esta página es solo para la presentación — no la ven los clientes ni empleados.
        </p>
      </div>
    </div>
  )
}
