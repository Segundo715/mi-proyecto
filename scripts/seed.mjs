/**
 * CLI de fases por rol — controla qué ve cada audiencia
 *
 *   npm run seed:1   →  👥 USUARIO  : solo menú visible para el cliente
 *   npm run seed:2   →  👥 USUARIO  : menú + tarjeta de lealtad
 *   npm run seed:3   →  👥 USUARIO  : todo (menú + tarjeta + reseñas)
 *   npm run seed:emp →  👷 EMPLEADO : siembra recetas + pedido de demo
 *   npm run seed:adm →  👑 ADMIN    : siembra reseña negativa + inventario con alertas
 *   npm run seed     →  muestra ayuda
 *
 * Llama a la API de Vercel (no Supabase directo) para evitar problemas de red local.
 */

import { createHmac } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = join(__dir, '..')

// ── Config ───────────────────────────────────────────────────────────────────

const SECRET  = process.env.ADMIN_SECRET ?? 'dev-secret'
const APP_URL = process.env.APP_URL ?? 'https://mi-proyecto-phi-ecru.vercel.app'

function sessionToken() {
  const id  = 'cli-demo'
  const sig = createHmac('sha256', SECRET).update(id).digest('hex')
  return `${id}.${sig}`
}

const COOKIE = `admin_session=${sessionToken()}`

// ── Helpers ──────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function api(path, body, intentos = 4) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const res = await fetch(`${APP_URL}${path}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Cookie: COOKIE },
        body:    JSON.stringify(body),
      })
      return res.json()
    } catch (e) {
      if (i === intentos) throw e
      await sleep(1000 * i)
    }
  }
}

async function setSetting(key, value) {
  const r = await api('/api/settings', { key, value })
  if (!r.ok) throw new Error(JSON.stringify(r))
}

async function seedMenu() {
  const r = await api('/api/menu/seed', {})
  return r
}

// ── Configuraciones de nav por fase ──────────────────────────────────────────

const NAV_BASE = {
  bg: '#0d0d0d', border: '#1a1a1a', accent: '#B90F45',
  inactive: '#6b7280', radius: 9999, showLogout: true,
}

const FASES_NAV = {
  1: { ...NAV_BASE, tabs: [
    { id: 'menu',   label: 'Menú',    href: '/menu',   icon: '' },
  ]},
  2: { ...NAV_BASE, tabs: [
    { id: 'menu',   label: 'Menú',    href: '/menu',   icon: '' },
    { id: 'card',   label: 'Tarjeta', href: '/card',   icon: '' },
  ]},
  3: { ...NAV_BASE, tabs: [
    { id: 'menu',   label: 'Menú',    href: '/menu',   icon: '' },
    { id: 'card',   label: 'Tarjeta', href: '/card',   icon: '' },
    { id: 'review', label: 'Reseñas', href: '/review', icon: '' },
  ]},
}

// ── Fases ─────────────────────────────────────────────────────────────────────

async function fase1() {
  console.log('\n👥  FASE 1 — USUARIO: Solo Menú\n')
  console.log('   Insertando platillos...')
  const r = await seedMenu()
  console.log(r.created > 0
    ? `   ✅  ${r.created} platillos insertados`
    : `   ⏭  Menú ya cargado (${r.skipped} platillos)`)

  console.log('   Actualizando navegación del cliente...')
  await setSetting('customer_nav', JSON.stringify(FASES_NAV[1]))
  console.log('   ✅  Nav actualizada — solo "Menú" visible\n')

  console.log('   Qué ve el cliente ahora:')
  console.log('   🍽️  /menu  ← única opción disponible')
  console.log('   🔒  /card  — oculta')
  console.log('   🔒  /review — oculta\n')
}

async function fase2() {
  console.log('\n👥  FASE 2 — USUARIO: Menú + Tarjeta de Lealtad\n')
  console.log('   Actualizando navegación del cliente...')
  await setSetting('customer_nav', JSON.stringify(FASES_NAV[2]))
  console.log('   ✅  Nav actualizada — "Menú" y "Tarjeta" visibles\n')

  console.log('   Qué ve el cliente ahora:')
  console.log('   🍽️  /menu  ← visible')
  console.log('   🃏  /card  ← visible')
  console.log('   🔒  /review — oculta\n')
}

async function fase3() {
  console.log('\n👥  FASE 3 — USUARIO: Todo visible\n')
  console.log('   Actualizando navegación del cliente...')
  await setSetting('customer_nav', JSON.stringify(FASES_NAV[3]))
  console.log('   ✅  Nav actualizada — Menú + Tarjeta + Reseñas visibles\n')

  console.log('   Qué ve el cliente ahora:')
  console.log('   🍽️  /menu   ← visible')
  console.log('   🃏  /card   ← visible')
  console.log('   ⭐  /review ← visible\n')
}

async function faseEmpleado() {
  console.log('\n👷  EMPLEADO — Recetas + Pedido de demo\n')

  // Recetas
  console.log('   ── Recetas ──')
  const recetas = [
    {
      name: 'Hamburguesa Clásica',
      ingredients: [
        { name: 'Carne de res molida', quantity: '180', unit: 'g' },
        { name: 'Pan para hamburguesa', quantity: '1', unit: 'pieza' },
        { name: 'Queso cheddar', quantity: '1', unit: 'rebanada' },
        { name: 'Aderezo de la casa', quantity: '2', unit: 'cdas' },
      ],
      steps: [
        { step: 1, description: 'Forma la hamburguesa y sazona con sal y pimienta.' },
        { step: 2, description: 'Cocina en comal caliente 3 min por lado.' },
        { step: 3, description: 'Coloca el queso al final 1 min para que se derrita.' },
        { step: 4, description: 'Tuesta el pan 1 min y unta el aderezo.' },
        { step: 5, description: 'Arma: pan, aderezo, carne con queso, lechuga, jitomate, tapa.' },
      ],
    },
    {
      name: 'Pizza Margherita',
      ingredients: [
        { name: 'Masa de pizza', quantity: '250', unit: 'g' },
        { name: 'Salsa de tomate', quantity: '4', unit: 'cdas' },
        { name: 'Mozzarella fresca', quantity: '150', unit: 'g' },
        { name: 'Albahaca fresca', quantity: '8', unit: 'hojas' },
      ],
      steps: [
        { step: 1, description: 'Precalienta el horno a 250 °C.' },
        { step: 2, description: 'Estira la masa hasta 30 cm y cubre con salsa.' },
        { step: 3, description: 'Distribuye la mozzarella en trozos.' },
        { step: 4, description: 'Hornea 9 min hasta que el borde dore.' },
        { step: 5, description: 'Agrega albahaca fresca al sacar del horno.' },
      ],
    },
  ]

  for (const r of recetas) {
    const res = await api('/api/recipes', r).catch(() => null)
    if (res) console.log(`   ✅  Receta: ${r.name}`)
    else     console.log(`   ⏭  Ya existe o error: ${r.name}`)
  }

  // Pedido demo
  console.log('\n   ── Pedido de ejemplo ──')
  const pedido = await api('/api/orders', {
    customerName: 'Mesa 4',
    tableNumber: '4',
    items: [
      { name: 'Hamburguesa Clásica', quantity: 2, price: 120 },
      { name: 'Café Americano',      quantity: 2, price: 45  },
    ],
    total: 330,
    notes: 'Sin cebolla',
  }).catch(() => null)

  if (pedido?.id) console.log('   ✅  Pedido Mesa 4 — pendiente  $330')
  else            console.log('   ⏭  Pedido no creado (ya existe o error)')

  console.log('\n   Qué mostrar al empleado:')
  console.log('   📖  /employee/recipes  — busca "Hamburguesa" y la IA explica paso a paso')
  console.log('   📦  /employee/orders   — Mesa 4 aparece como pedido pendiente\n')
}

async function faseAdmin() {
  console.log('\n👑  ADMIN — Reseña negativa + Inventario con alertas\n')

  // Reseñas
  console.log('   ── Reseñas ──')
  const resenas = [
    { customerName: 'Ana Rodríguez', rating: 5, comment: 'Excelente servicio, la hamburguesa estaba perfecta. Regreso seguro.' },
    { customerName: 'Jorge Pérez',   rating: 2, comment: 'La pizza llegó fría y el servicio estuvo muy lento. Espero que mejoren.' },
  ]
  for (const r of resenas) {
    const res = await api('/api/reviews', r).catch(() => null)
    const emoji = r.rating >= 4 ? '⭐' : '🔴'
    if (res?.id) console.log(`   ✅  ${emoji} ${r.customerName} — ${r.rating}⭐`)
    else         console.log(`   ⏭  ${r.customerName} — ya existe o error`)
  }

  // Inventario con alertas de stock bajo
  console.log('\n   ── Inventario (con alertas) ──')
  const items = [
    { name: 'Carne de res molida', category: 'Carnes', stock: 12, minStock: 5,  unit: 'kg', cost: 180 },
    { name: 'Tocino',              category: 'Carnes', stock: 1,  minStock: 3,  unit: 'kg', cost: 210 },
    { name: 'Fresas frescas',      category: 'Frutas', stock: 1,  minStock: 4,  unit: 'kg', cost: 95  },
  ]
  for (const i of items) {
    const res = await api('/api/inventory', i).catch(() => null)
    const alerta = i.stock < i.minStock ? '  ⚠️  BAJO STOCK' : ''
    if (res?.id) console.log(`   ✅  ${i.name} — ${i.stock} ${i.unit}${alerta}`)
    else         console.log(`   ⏭  ${i.name} — ya existe o error`)
  }

  console.log('\n   Qué mostrar al admin:')
  console.log('   📊  /admin             — dashboard general')
  console.log('   ⭐  /admin/reviews     — reseña de Jorge en rojo (alerta)')
  console.log('   📦  /admin/inventario  — Tocino y Fresas con stock bajo\n')
}

// ── Ayuda ─────────────────────────────────────────────────────────────────────

function ayuda() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         CLI de Demo por Fases — Control por Rol              ║
╚═══════════════════════════════════════════════════════════════╝

  FASES DEL CLIENTE (controlan qué ve en el menú inferior):
  npm run seed:1    →  👥  Solo Menú visible
  npm run seed:2    →  👥  Menú + Tarjeta de Lealtad
  npm run seed:3    →  👥  Todo: Menú + Tarjeta + Reseñas

  DATOS DE DEMOSTRACIÓN:
  npm run seed:emp  →  👷  Recetas + Pedido activo (para empleado)
  npm run seed:adm  →  👑  Reseña negativa + Inventario con alertas (para admin)
`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

const fase = process.argv[2]
try {
  switch (fase) {
    case '1':   await fase1();        break
    case '2':   await fase2();        break
    case '3':   await fase3();        break
    case 'emp': await faseEmpleado(); break
    case 'adm': await faseAdmin();    break
    default:    ayuda();              break
  }
} catch (e) {
  console.error('\n❌  Error:', e.message)
  console.error('   Verifica que APP_URL sea correcta y que ADMIN_SECRET coincida con el de Vercel.\n')
  process.exit(1)
}
