// IA gratuita usando Groq (Llama 3.3 70B). Sin costo, sin tarjeta de crédito.
// Clave: GROQ_API_KEY en .env.local (gratis en console.groq.com)
// Contexto inyectado en tiempo real desde Supabase según el rol.
import { getAllOrders } from '@/lib/ordersDb'
import { getAllMenuItems } from '@/lib/menuDb'
import { getAllRecipes } from '@/lib/recipeDb'
import { getSetting } from '@/lib/settingsDb'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

type Role = 'cook' | 'staff' | 'customer' | 'admin' | 'recipe'

async function buildSystem(role: Role, restaurantName: string): Promise<string> {
  const now = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', hour12: true })

  const base = `Eres el asistente inteligente del restaurante "${restaurantName}".
Hora actual: ${now}.
REGLAS: Responde SIEMPRE en español. Sé breve, directo y útil. Usa emojis con moderación.`

  if (role === 'cook' || role === 'staff') {
    const [orders, menu, recipes] = await Promise.all([getAllOrders(), getAllMenuItems(), getAllRecipes()])
    const active = orders.filter(o => o.status !== 'delivered')

    const statusLabel: Record<string, string> = {
      pending: 'pendiente', preparing: 'preparando', ready: 'listo', picked_up: 'recogido por rider',
    }

    const ordersText = active.length === 0
      ? 'Sin pedidos activos.'
      : active.map(o => {
          const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000)
          const platform = o.notes?.match(/^\[(\w+)\]/)?.[1]
          const loc = platform ? `[${platform}]` : (o.tableNumber ? `Mesa ${o.tableNumber}` : 'sin mesa')
          const items = o.items.map(i => `${i.quantity}×${i.name}`).join(', ')
          return `• ${o.customerName} | ${loc} | ${statusLabel[o.status] ?? o.status} | ${mins}min${items ? ' | ' + items : ''}`
        }).join('\n')

    const menuText = menu.map(m => `${m.name} $${m.price} (${m.available ? '✓' : 'agotado'}) ${m.category}`).join('\n')

    const recipesText = recipes.map(r =>
      `▸ ${r.name}: ${r.description}\n  Ingredientes: ${r.ingredients.join(', ')}\n  Pasos: ${r.steps.join(' → ')}`
    ).join('\n\n')

    return `${base}

${role === 'cook'
  ? `Rol: COCINERO.
INSTRUCCIÓN ESPECIAL PARA RECETAS: Cuando te pregunten cómo preparar algo, da los pasos NUMERADOS, uno por uno, de forma clara. Si el cocinero dice "siguiente" o "continúa", da el siguiente paso. Sé el mejor sous-chef posible.`
  : 'Rol: MESERO — ayuda con estado de pedidos, mesas y menú.'}

## PEDIDOS ACTIVOS AHORA
${ordersText}

## MENÚ
${menuText}

## RECETARIO COMPLETO (con pasos detallados)
${recipesText}`
  }

  if (role === 'recipe') {
    const recipes = await getAllRecipes()
    const menu = await getAllMenuItems()
    const menuText = menu.filter(m => m.available).map(m => `${m.name} $${m.price}`).join(', ')
    const recipesText = recipes.map(r =>
      `▸ ${r.name}${r.description ? ': ' + r.description : ''}\n  Ingredientes: ${r.ingredients.join(', ')}\n  Pasos:\n${r.steps.map((s, i) => `    ${i+1}. ${s}`).join('\n')}`
    ).join('\n\n')
    return `${base}

Eres el CHEF VIRTUAL del restaurante. Especialista en el recetario de "${restaurantName}".
Cuando expliques una receta: usa pasos NUMERADOS y claros. Si te piden "siguiente paso", continúa donde te quedaste.
Puedes sugerir variaciones, sustituciones de ingredientes y trucos de cocina.

## RECETARIO COMPLETO
${recipesText}

## MENÚ DISPONIBLE
${menuText}`
  }

  if (role === 'customer') {
    const [orders, menu] = await Promise.all([getAllOrders(), getAllMenuItems()])
    const active = orders.filter(o => o.status !== 'delivered')
    const available = menu.filter(m => m.available)

    const statusLabel: Record<string, string> = {
      pending: 'en cola ⏳', preparing: 'en preparación 🍳', ready: 'listo para entregar ✅', picked_up: 'en camino 🛵',
    }
    const estimateMins: Record<string, number> = { pending: 20, preparing: 12, ready: 0, picked_up: 15 }

    const ordersText = active.length === 0
      ? 'No hay pedidos activos en este momento.'
      : active.map(o => {
          const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000)
          const est = Math.max(0, estimateMins[o.status] - mins)
          return `• ${o.customerName} → ${statusLabel[o.status] ?? o.status}${est > 0 ? `, ~${est} min` : ' (¡ya listo!)'}`
        }).join('\n')

    const menuText = available.map(m => `${m.name} $${m.price} — ${m.category}`).join('\n')

    return `${base}

Rol: ASISTENTE AL CLIENTE.
Puedes: verificar estado del pedido por nombre, dar tiempos estimados, recomendar platillos.

## PEDIDOS EN CURSO
${ordersText}

## MENÚ DISPONIBLE
${menuText}`
  }

  // admin
  const [orders, menu, recipes] = await Promise.all([getAllOrders(), getAllMenuItems(), getAllRecipes()])
  const today = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today)
  const revenue = todayOrders.reduce((s, o) => s + (o.total ?? 0), 0)
  const active = orders.filter(o => o.status !== 'delivered')
  const byStatus = active.reduce<Record<string, number>>((acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc }, {})

  return `${base}

Rol: ADMINISTRADOR — acceso completo a datos operativos y analíticos.

## HOY
Pedidos: ${todayOrders.length} | Ventas: $${revenue.toFixed(2)} | Activos: ${active.length}
Por estado: ${Object.entries(byStatus).map(([s, c]) => `${s}:${c}`).join(', ')}
Menú: ${menu.length} ítems | Recetas: ${recipes.length}

## PEDIDOS ACTIVOS
${active.length === 0 ? 'Ninguno.' : active.map(o => `• ${o.customerName} | ${o.status} | $${o.total}`).join('\n')}

## PEDIDOS DE HOY (últimos 30)
${todayOrders.slice(0, 30).map(o => `${o.customerName} | ${o.status} | $${o.total} | ${new Date(o.createdAt).toLocaleTimeString('es-MX')}`).join('\n')}`
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return Response.json({ error: 'GROQ_API_KEY no configurada' }, { status: 500 })

  const { messages, role = 'staff' } = await req.json()
  const restaurantName = await getSetting('restaurant_name', 'Restaurante')
  const system = await buildSystem(role as Role, restaurantName)

  const groqRes = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: system }, ...messages],
      stream: true,
      max_tokens: 1024,
      temperature: 0.6,
    }),
  })

  if (!groqRes.ok) {
    const err = await groqRes.text()
    return Response.json({ error: err }, { status: groqRes.status })
  }

  const encoder = new TextEncoder()
  const reader = groqRes.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const body = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') { controller.close(); return }
          try {
            const json = JSON.parse(data)
            const text = json.choices?.[0]?.delta?.content
            if (text) controller.enqueue(encoder.encode(text))
          } catch { /* fragmentos SSE incompletos */ }
        }
      }
      controller.close()
    },
  })

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
