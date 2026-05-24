import { NextRequest } from 'next/server'
import { getCard, addStamp, redeemCoffee, deleteCard } from '@/lib/loyaltyDb'
import { verifySession } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: RouteContext<'/api/loyalty/[id]'>) {
  const { id } = await params
  const card = getCard(id)
  return card ? Response.json(card) : Response.json({ error: 'No encontrado' }, { status: 404 })
}

export async function PATCH(req: NextRequest, { params }: RouteContext<'/api/loyalty/[id]'>) {
  if (!verifySession(req.cookies.get('admin_session')?.value))
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { action } = await req.json()
  const result = action === 'stamp' ? addStamp(id) : action === 'redeem' ? redeemCoffee(id) : null
  return result ? Response.json(result) : Response.json({ error: 'Error' }, { status: 400 })
}

export async function DELETE(req: NextRequest, { params }: RouteContext<'/api/loyalty/[id]'>) {
  if (!verifySession(req.cookies.get('admin_session')?.value))
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  return deleteCard(id)
    ? Response.json({ ok: true })
    : Response.json({ error: 'No encontrado' }, { status: 404 })
}
