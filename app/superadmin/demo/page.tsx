'use client'

import { useState } from 'react'

type St = 'idle' | 'loading' | 'done' | 'error'

const NAV_BASE = {
  bg: '#0d0d0d', border: '#1a1a1a', accent: '#B90F45',
  inactive: '#6b7280', radius: 9999, showLogout: true,
}
const NAV_FASES = {
  1: { ...NAV_BASE, tabs: [{ id: 'menu', label: 'Menú', href: '/menu', icon: '' }] },
  2: { ...NAV_BASE, tabs: [{ id: 'menu', label: 'Menú', href: '/menu', icon: '' }, { id: 'card', label: 'Tarjeta', href: '/card', icon: '' }] },
  3: { ...NAV_BASE, tabs: [{ id: 'menu', label: 'Menú', href: '/menu', icon: '' }, { id: 'card', label: 'Tarjeta', href: '/card', icon: '' }, { id: 'review', label: 'Reseñas', href: '/review', icon: '' }] },
}

async function setSetting(key: string, value: string) {
  const r = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) })
  if (!r.ok) throw new Error('No autorizado — inicia sesión en /admin primero')
}

const ACCIONES: Record<string, () => Promise<string>> = {
  fase1: async () => { await setSetting('customer_nav', JSON.stringify(NAV_FASES[1])); return 'Solo Menú visible' },
  fase2: async () => { await setSetting('customer_nav', JSON.stringify(NAV_FASES[2])); return 'Menú + Tarjeta visibles' },
  fase3: async () => { await setSetting('customer_nav', JSON.stringify(NAV_FASES[3])); return 'Todo visible' },
  menu: async () => {
    const r = await fetch('/api/menu/seed', { method: 'POST' }).then(r => r.json())
    return r.created > 0 ? `${r.created} platillos insertados` : `Menú ya cargado`
  },
  rec: async () => {
    const recetas = [
      { name: 'Hamburguesa Clásica', ingredients: [{ name: 'Carne de res molida', quantity: '180', unit: 'g' }, { name: 'Pan para hamburguesa', quantity: '1', unit: 'pieza' }, { name: 'Queso cheddar', quantity: '1', unit: 'rebanada' }], steps: [{ step: 1, description: 'Forma la hamburguesa y sazona con sal y pimienta.' }, { step: 2, description: 'Cocina en comal caliente 3 min por lado.' }, { step: 3, description: 'Coloca el queso al final 1 min para que se derrita.' }, { step: 4, description: 'Tuesta el pan 1 min y unta el aderezo.' }, { step: 5, description: 'Arma: pan, aderezo, carne con queso, lechuga, jitomate, tapa.' }] },
      { name: 'Pizza Margherita', ingredients: [{ name: 'Masa de pizza', quantity: '250', unit: 'g' }, { name: 'Salsa de tomate', quantity: '4', unit: 'cdas' }, { name: 'Mozzarella fresca', quantity: '150', unit: 'g' }], steps: [{ step: 1, description: 'Precalienta el horno a 250 °C.' }, { step: 2, description: 'Estira la masa hasta 30 cm y cubre con salsa.' }, { step: 3, description: 'Distribuye la mozzarella en trozos.' }, { step: 4, description: 'Hornea 9 min hasta que el borde dore.' }, { step: 5, description: 'Agrega albahaca fresca al sacar del horno.' }] },
    ]
    let ok = 0
    for (const r of recetas) { const res = await fetch('/api/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) }); if (res.ok) ok++ }
    return ok > 0 ? `${ok} recetas insertadas` : 'Recetas ya cargadas'
  },
  ped: async () => {
    const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName: 'Mesa 4', tableNumber: '4', items: [{ name: 'Hamburguesa Clásica', quantity: 2, price: 120 }, { name: 'Café Americano', quantity: 2, price: 45 }], total: 330, notes: 'Sin cebolla' }) }).then(r => r.json())
    return r.id ? 'Mesa 4 — pendiente $330' : 'Pedido ya existe'
  },
  res: async () => {
    const resenas = [{ customerName: 'Ana Rodríguez', rating: 5, comment: 'Excelente servicio, la hamburguesa estaba perfecta.' }, { customerName: 'Jorge Pérez', rating: 2, comment: 'La pizza llegó fría y el servicio estuvo muy lento.' }]
    let ok = 0
    for (const r of resenas) { const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) }); if (res.ok) ok++ }
    return ok > 0 ? `${ok} reseñas (1 negativa → alerta roja)` : 'Reseñas ya cargadas'
  },
  tv: async () => {
    const slides = [{ title: '🍔 Hamburguesa BBQ', subtitle: 'Carne de res, tocino y salsa ahumada', price: '$145', isOffer: true, active: true }, { title: '🍕 Pizza del Día', subtitle: 'Margherita con mozzarella y albahaca', price: '$140', isOffer: true, active: true }, { title: '☕ Café + Postre', subtitle: 'Americano + cheesecake de fresa', price: '$120', isOffer: true, active: true }]
    let ok = 0
    for (const s of slides) { const res = await fetch('/api/tv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) }); if (res.ok) ok++ }
    return ok > 0 ? `${ok} slides TV insertados` : 'Slides ya cargados'
  },
  leal: async () => {
    const r = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'María García', phone: '6641234567', age: 28 }) }).then(r => r.json())
    return r.id ? 'María García — cliente demo creada' : 'Cliente ya existe'
  },
  dash: async () => 'Usa el botón Ver ↗ para abrir el dashboard',
}

interface Boton { id: string; label: string; desc: string; href?: string; color: string }
interface Link  { label: string; href: string; desc: string }

const ADMIN_LINKS: Link[] = [
  { label: '📊 Dashboard',     href: '/admin',               desc: 'Resumen general' },
  { label: '📈 Analíticas',    href: '/admin/analytics',     desc: 'Ventas por día y semana' },
  { label: '⭐ Reseñas',       href: '/admin/reviews',       desc: 'Buenas y malas' },
  { label: '📦 Inventario',    href: '/admin/inventario',    desc: 'Stock bajo en alertas' },
  { label: '🍽️ Menú',         href: '/admin/menu',          desc: 'Gestión de platillos' },
  { label: '🃏 Tarjetas',      href: '/admin/tarjetas',      desc: 'Lealtad de clientes' },
  { label: '👥 Clientes',      href: '/admin/customers',     desc: 'Base de datos CRM' },
  { label: '📺 Pantalla TV',   href: '/admin/tv',            desc: 'Señalización digital' },
  { label: '🪑 Reservaciones', href: '/admin/reservaciones', desc: 'Plano de mesas' },
  { label: '⚙️ Config',        href: '/admin/configuracion', desc: 'Logo, colores y nombre' },
]

const SECCIONES = [
  {
    titulo: '👥 Cliente — Fases',
    sub: 'Controla qué tabs ve el cliente en su teléfono',
    botones: [
      { id: 'fase1', label: '① Solo Menú',      desc: 'Oculta Tarjeta y Reseñas',  href: '/menu',   color: '#f59e0b' },
      { id: 'fase2', label: '② Menú + Tarjeta', desc: 'Agrega tarjeta de lealtad', href: '/card',   color: '#10b981' },
      { id: 'fase3', label: '③ Todo visible',   desc: 'Agrega reseñas',            href: '/review', color: '#a78bfa' },
    ] as Boton[],
  },
  {
    titulo: '👷 Empleado — Datos',
    sub: 'Inserta datos para el panel del empleado',
    botones: [
      { id: 'menu', label: '🍽️ Menú',         desc: '4 platillos demo',         href: '/menu',             color: '#f59e0b' },
      { id: 'rec',  label: '📖 Recetas',       desc: '2 recetas con pasos',      href: '/employee/recipes', color: '#06b6d4' },
      { id: 'ped',  label: '📦 Pedido activo', desc: 'Mesa 4 — pendiente $330',  href: '/employee/orders',  color: '#8b5cf6' },
      { id: 'leal', label: '🃏 Lealtad',       desc: 'Cliente con 4 sellos',     href: '/employee',         color: '#f97316' },
    ] as Boton[],
  },
  {
    titulo: '👑 Admin — Datos',
    sub: 'Inserta datos para el panel de administrador',
    botones: [
      { id: 'res',  label: '⭐ Reseñas',       desc: '1 buena + 1 mala (alerta)', href: '/admin/reviews', color: '#ec4899' },
      { id: 'dash', label: '📊 Dashboard',     desc: 'Ventas y analíticas',       href: '/admin',         color: '#6366f1' },
      { id: 'tv',   label: '📺 Pantalla TV',   desc: '3 slides de ofertas',       href: '/admin/tv',      color: '#14b8a6' },
    ] as Boton[],
  },
]

export default function SuperAdminDemo() {
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
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-[900px] mx-auto p-5 space-y-8">

        {/* Header */}
        <div className="pt-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(185,15,69,0.2)', color: '#B90F45' }}>
                SUPER ADMIN
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">Control de Demo</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Activa fases y módulos durante la presentación
            </p>
          </div>
          <a href="/admin" target="_blank"
            className="text-xs px-3 py-2 rounded-xl font-bold text-zinc-400 hover:text-white transition-colors"
            style={{ border: '1px solid #222' }}>
            Ir al Admin ↗
          </a>
        </div>

        {/* Secciones con botones */}
        {SECCIONES.map(sec => (
          <div key={sec.titulo}>
            <div className="mb-3">
              <h2 className="text-sm font-black text-white">{sec.titulo}</h2>
              <p className="text-xs text-zinc-500">{sec.sub}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sec.botones.map(b => {
                const st = estados[b.id] ?? 'idle'
                return (
                  <div key={b.id} className="rounded-2xl p-4 flex flex-col gap-2"
                    style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-black text-white">{b.label}</p>
                        <p className="text-xs text-zinc-500">{b.desc}</p>
                      </div>
                      {st === 'done' && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✓</span>
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
                    <div className="flex gap-2 mt-auto pt-1">
                      <button onClick={() => ejecutar(b.id)} disabled={st === 'loading'}
                        className="flex-1 py-2 rounded-xl text-xs font-black disabled:opacity-40 transition-all hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: b.color, color: '#000' }}>
                        {st === 'loading' ? 'Cargando…' : st === 'done' ? '↺ Repetir' : '⚡ Activar'}
                      </button>
                      {b.href && (
                        <a href={b.href} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                          style={{ border: '1px solid #222' }}>
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
            <h2 className="text-sm font-black text-white">👑 Admin — Accesos directos</h2>
            <p className="text-xs text-zinc-500">Abre cada sección del panel para mostrarla</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {ADMIN_LINKS.map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                className="rounded-xl p-3 flex flex-col gap-0.5 hover:border-zinc-600 transition-colors"
                style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
                <span className="text-xs font-black text-white">{l.label} ↗</span>
                <span className="text-[11px] text-zinc-500">{l.desc}</span>
              </a>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-zinc-700 pb-4">
          /superadmin/demo — solo para el presentador
        </p>
      </div>
    </div>
  )
}
