// Groq (Llama 3.3 70B) — streaming de texto.
// Para el rol "customer" el cliente envía menuContext para evitar
// llamadas extra a Supabase y cumplir el timeout de 10 s de Vercel Hobby.
import { getAllOrders } from '@/lib/ordersDb'
import { getAllMenuItems } from '@/lib/menuDb'
import { getAllRecipes } from '@/lib/recipeDb'
import { getSetting } from '@/lib/settingsDb'

const GROQ_URL       = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL_FAST     = 'llama-3.1-8b-instant'    // cliente: <1s TTFT
const MODEL_POWERFUL = 'llama-3.3-70b-versatile' // staff/admin: más contexto

type Role = 'cook' | 'staff' | 'customer' | 'admin' | 'recipe'
interface SimpleMenu { id: string; name: string; price: number; category: string; description?: string }

async function buildSystem(
  role: Role,
  restaurantName: string,
  menuContext?: SimpleMenu[],
): Promise<string> {
  const now  = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', hour12: true })
  const base = `Eres el asistente inteligente del restaurante "${restaurantName}". Hora actual: ${now}.
Responde SIEMPRE en español. Sé breve, directo y útil.`

  // Timeout compartido para todas las llamadas a Supabase (2.5 s por llamada)
  const safe = <T,>(p: Promise<T>, fallback: T): Promise<T> =>
    Promise.race([p, new Promise<T>(res => setTimeout(() => res(fallback), 2500))])

  // ── CLIENTE: usa el menú enviado por el cliente (sin llamadas a Supabase) ──
  if (role === 'customer') {
    const menuText = menuContext && menuContext.length > 0
      ? menuContext.map(m => `${m.name} $${m.price} — ${m.category}${m.description ? ' — ' + m.description.slice(0, 80) : ''}`).join('\n')
      : 'Menú no disponible en este momento.'

    return `${base}

Rol: ASISTENTE AL CLIENTE — recomiendas platillos, informas sobre el menú.
IMPORTANTE: cuando recomiendes platillos menciona su nombre EXACTAMENTE como aparece en el menú (mismas mayúsculas y tildes). Recomienda máximo 4 platillos a la vez.

## MENÚ DISPONIBLE
${menuText}`
  }

  // ── COOK / STAFF ──
  if (role === 'cook' || role === 'staff') {
    const [orders, menu, recipes] = await Promise.all([
      safe(getAllOrders(), []),
      safe(getAllMenuItems(), []),
      safe(getAllRecipes(), []),
    ])
    const active = orders.filter(o => o.status !== 'delivered').slice(0, 30)
    const labels: Record<string, string> = { pending: 'pendiente', preparing: 'preparando', ready: 'listo', picked_up: 'con rider' }

    const ordersText = active.length === 0 ? 'Sin pedidos activos.' : active.map(o => {
      const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000)
      const loc  = o.notes?.match(/^\[(\w+)\]/)?.[1] ?? (o.tableNumber ? `Mesa ${o.tableNumber}` : 'sin mesa')
      return `• ${o.customerName} | ${loc} | ${labels[o.status] ?? o.status} | ${mins}min | ${o.items.map(i => `${i.quantity}×${i.name}`).join(', ')}`
    }).join('\n')

    const menuText    = menu.map(m => `${m.name} $${m.price} (${m.available ? '✓' : 'agotado'})`).join('\n')
    const recipesText = recipes.map(r =>
      `▸ ${r.name}\n  Ingredientes: ${r.ingredients.join(', ')}\n  Pasos: ${r.steps.map((s, i) => `${i + 1}. ${s}`).join(' → ')}`
    ).join('\n\n')

    return `${base}
Rol: ${role === 'cook' ? 'COCINERO — da pasos numerados para recetas. Si dicen "siguiente" continúa donde quedaste.' : 'MESERO — info de pedidos y menú.'}

## PEDIDOS ACTIVOS
${ordersText}

## MENÚ
${menuText}

## RECETARIO
${recipesText}`
  }

  // ── RECIPE ──
  if (role === 'recipe') {
    const [recipes, menu] = await Promise.all([
      safe(getAllRecipes(), []),
      safe(getAllMenuItems(), []),
    ])
    const recipesText = recipes.map(r =>
      `▸ ${r.name}${r.description ? ': ' + r.description : ''}\n  Ingredientes: ${r.ingredients.join(', ')}\n  Pasos:\n${r.steps.map((s, i) => `    ${i + 1}. ${s}`).join('\n')}`
    ).join('\n\n')
    const menuText = menu.filter(m => m.available).map(m => `${m.name} $${m.price}`).join(', ')

    return `${base}
Eres el CHEF VIRTUAL. Explicas recetas paso a paso. Puedes sugerir variaciones y sustituciones.

## RECETARIO
${recipesText}

## MENÚ DISPONIBLE
${menuText}`
  }

  // ── ADMIN ──
  const [orders, menu, recipes] = await Promise.all([
    safe(getAllOrders(), []),
    safe(getAllMenuItems(), []),
    safe(getAllRecipes(), []),
  ])
  const today       = new Date().toDateString()
  const todayOrders = (orders as Awaited<ReturnType<typeof getAllOrders>>).filter(o => new Date(o.createdAt).toDateString() === today)
  const active      = (orders as Awaited<ReturnType<typeof getAllOrders>>).filter(o => o.status !== 'delivered')
  const revenue     = todayOrders.reduce((s, o) => s + (o.total ?? 0), 0)

  return `${base}
Rol: ADMINISTRADOR — acceso completo a datos.

## HOY: ${todayOrders.length} pedidos | $${revenue.toFixed(2)} en ventas | ${active.length} activos
Menú: ${(menu as Awaited<ReturnType<typeof getAllMenuItems>>).length} ítems | Recetas: ${(recipes as Awaited<ReturnType<typeof getAllRecipes>>).length}

## PEDIDOS ACTIVOS
${active.length === 0 ? 'Ninguno.' : active.map(o => `• ${o.customerName} | ${o.status} | $${o.total}`).join('\n')}

## VENTAS DE HOY (últimas 30)
${todayOrders.slice(0, 30).map(o => `${o.customerName} | ${o.status} | $${o.total} | ${new Date(o.createdAt).toLocaleTimeString('es-MX')}`).join('\n')}`
}

function streamText(text: string): Response {
  const enc = new TextEncoder()
  return new Response(
    new ReadableStream({ start(c) { c.enqueue(enc.encode(text)); c.close() } }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return streamText('El asistente IA no está configurado en este servidor. Contacta al administrador.')

    const body = await req.json()
    const { messages, role = 'staff', menuContext } = body

    let restaurantName = 'Restaurante'
    try {
      restaurantName = await Promise.race([
        getSetting('restaurant_name', 'Restaurante'),
        new Promise<string>(res => setTimeout(() => res('Restaurante'), 1000)),
      ])
    } catch { /* usa fallback */ }

    let system: string
    try {
      system = await buildSystem(role as Role, restaurantName, menuContext)
    } catch {
      const now = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', hour12: true })
      system = `Eres el asistente del restaurante "${restaurantName}". Hora: ${now}. Responde en español.`
    }

    type ChatMsg = { role: string; content: string }
    const cleanMsgs: ChatMsg[] = (messages as ChatMsg[]).filter(
      (m: ChatMsg, i: number) => !(i === 0 && m.role === 'assistant')
    )

    // customer usa modelo rápido (8B): TTFT <1s → timeout 8s ampliado
    // otros roles usan 70B con datos de Supabase: getSetting(1s)+buildSystem(2.5s)+Groq(6s)=9.5s
    const isCustomer  = (role as Role) === 'customer'
    const model       = isCustomer ? MODEL_FAST : MODEL_POWERFUL
    const groqMs      = isCustomer ? 8000 : 6000

    const groqCtrl    = new AbortController()
    const groqTimeout = setTimeout(() => groqCtrl.abort(), groqMs)
    let groqRes: Response
    try {
      groqRes = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: system }, ...cleanMsgs],
          stream: true,
          max_tokens: isCustomer ? 500 : 600,
          temperature: 0.65,
        }),
        signal: groqCtrl.signal,
      })
    } catch {
      clearTimeout(groqTimeout)
      return streamText('El asistente tardó demasiado. Intenta de nuevo en un momento.')
    }
    clearTimeout(groqTimeout)

    if (!groqRes.ok) {
      const msg = groqRes.status === 429
        ? 'El asistente alcanzó su límite de uso. Intenta en unos minutos.'
        : `Error al contactar la IA (${groqRes.status}). Intenta de nuevo.`
      return streamText(msg)
    }

    const encoder = new TextEncoder()
    const reader  = groqRes.body!.getReader()
    const decoder = new TextDecoder()
    let buffer    = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
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
              } catch { /* fragmento SSE incompleto */ }
            }
          }
        } catch { /* cliente cerró conexión */ }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return streamText('Ocurrió un error inesperado. Intenta de nuevo.')
  }
}
