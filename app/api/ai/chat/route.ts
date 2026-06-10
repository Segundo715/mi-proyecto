import Anthropic from '@anthropic-ai/sdk'
import { getAllOrders } from '@/lib/ordersDb'
import { getAllMenuItems } from '@/lib/menuDb'
import { getAllRecipes } from '@/lib/recipeDb'
import { getSetting } from '@/lib/settingsDb'

const client = new Anthropic()

type Role = 'cook' | 'staff' | 'customer' | 'admin'

async function buildSystem(role: Role, restaurantName: string): Promise<string> {
  const now = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', hour12: true })

  const base = `Eres un asistente de IA para el restaurante "${restaurantName}".
Fecha y hora actual: ${now}.
Responde siempre en español. Sé conciso, útil y amigable. Usa emojis con moderación.`

  if (role === 'cook' || role === 'staff') {
    const [orders, menu, recipes] = await Promise.all([getAllOrders(), getAllMenuItems(), getAllRecipes()])
    const active = orders.filter(o => o.status !== 'delivered')

    const statusLabel: Record<string, string> = {
      pending: 'pendiente', preparing: 'preparando', ready: 'listo', picked_up: 'recogido por repartidor',
    }

    const ordersText = active.length === 0
      ? 'No hay pedidos activos en este momento.'
      : active.map(o => {
          const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000)
          const platform = o.notes?.match(/^\[(\w+)\]/)?.[1]
          return [
            `• ${o.customerName}`,
            platform ? `[${platform}]` : (o.tableNumber ? `Mesa ${o.tableNumber}` : ''),
            `| ${statusLabel[o.status] ?? o.status}`,
            `| ${mins} min`,
            o.items.length ? `| ${o.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}` : '',
          ].filter(Boolean).join(' ')
        }).join('\n')

    const menuText = menu.map(m => `${m.name} ($${m.price}) – ${m.available ? 'disponible' : 'agotado'} – ${m.category}`).join('\n')

    const recipesText = recipes.map(r =>
      `▸ ${r.name}${r.description ? ': ' + r.description : ''}\n  Ingredientes: ${r.ingredients.join(', ')}\n  Pasos: ${r.steps.join(' → ')}`
    ).join('\n\n')

    const roleNote = role === 'cook'
      ? 'Eres el asistente de COCINA. Ayuda a los cocineros con pedidos activos, tiempos de preparación y recetas.'
      : 'Eres el asistente para MESEROS y personal de sala. Ayuda con pedidos, tiempos y menú.'

    return `${base}\n\n${roleNote}\n\n## PEDIDOS ACTIVOS\n${ordersText}\n\n## MENÚ\n${menuText}\n\n## RECETARIO\n${recipesText}`
  }

  if (role === 'customer') {
    const [orders, menu] = await Promise.all([getAllOrders(), getAllMenuItems()])
    const active = orders.filter(o => o.status !== 'delivered')
    const available = menu.filter(m => m.available)

    const statusLabel: Record<string, string> = {
      pending: 'en cola', preparing: 'en preparación', ready: 'listo para entregar', picked_up: 'en camino',
    }
    const estimateMins: Record<string, number> = { pending: 20, preparing: 15, ready: 0, picked_up: 20 }

    const ordersText = active.length === 0
      ? 'No hay pedidos activos.'
      : active.map(o => {
          const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000)
          const est = Math.max(0, estimateMins[o.status] - mins)
          return `• ${o.customerName} → ${statusLabel[o.status] ?? o.status}${est > 0 ? `, ~${est} min restantes` : ' (listo ya)'}`
        }).join('\n')

    const menuText = available.map(m => `${m.name} $${m.price} – ${m.category}`).join('\n')

    return `${base}

Eres el asistente para CLIENTES. Puedes:
- Decirles el estado de su pedido si te dan su nombre
- Dar tiempos estimados de espera
- Recomendar platillos del menú disponible
- Responder dudas sobre el restaurante

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

  return `${base}

Eres el asistente del ADMINISTRADOR. Tienes acceso completo a todos los datos.

## RESUMEN HOY
Pedidos: ${todayOrders.length} | Ventas: $${revenue.toFixed(2)} | Activos ahora: ${active.length}
Ítems en menú: ${menu.length} | Recetas: ${recipes.length}

## PEDIDOS ACTIVOS
${active.length === 0 ? 'Ninguno.' : active.map(o => `• ${o.customerName} | ${o.status} | $${o.total}`).join('\n')}

## PEDIDOS DE HOY
${todayOrders.slice(0, 30).map(o => `${o.customerName} | ${o.status} | $${o.total} | ${new Date(o.createdAt).toLocaleTimeString('es-MX')}`).join('\n')}`
}

export async function POST(req: Request) {
  const { messages, role = 'staff' } = await req.json()
  const restaurantName = await getSetting('restaurant_name', 'Restaurante')
  const system = await buildSystem(role as Role, restaurantName)

  const stream = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system,
    messages,
    stream: true,
  })

  const encoder = new TextEncoder()
  const body = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
