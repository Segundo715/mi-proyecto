import { NextRequest } from 'next/server'
import { findOrCreate, getAllCards } from '@/lib/loyaltyDb'
import { verifySession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!verifySession(req.cookies.get('admin_session')?.value))
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  return Response.json(await getAllCards())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const name = (body.name ?? '').trim()
  const phone = (body.phone ?? '').trim()
  if (!name || !phone)
    return Response.json({ error: 'Nombre y teléfono requeridos' }, { status: 400 })
  const card = await findOrCreate(name, phone)
  return Response.json(card, { status: 201 })
}
