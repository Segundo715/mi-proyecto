import { NextRequest } from 'next/server'
import { getCustomer, confirmCustomer, addStamp, redeemCoffee } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/customers/[id]'>
) {
  const { id } = await ctx.params
  const c = getCustomer(id)
  if (!c) return Response.json({ error: 'No encontrado' }, { status: 404 })
  return Response.json(c)
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<'/api/customers/[id]'>
) {
  const { id } = await ctx.params
  const { action } = await req.json()

  if (action === 'confirm') {
    const c = confirmCustomer(id)
    if (!c) return Response.json({ error: 'No encontrado' }, { status: 404 })
    return Response.json(c)
  }

  if (action === 'stamp') {
    const c = addStamp(id)
    if (!c) return Response.json({ error: 'No encontrado o no confirmado' }, { status: 404 })
    return Response.json(c)
  }

  if (action === 'redeem') {
    const c = redeemCoffee(id)
    if (!c) return Response.json({ error: 'No encontrado' }, { status: 404 })
    return Response.json(c)
  }

  return Response.json({ error: 'Acción inválida' }, { status: 400 })
}
