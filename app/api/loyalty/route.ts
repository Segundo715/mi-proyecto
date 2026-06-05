import { NextRequest } from 'next/server'
import { findOrCreate, getAllCards } from '@/lib/loyaltyDb'
import { verifySession } from '@/lib/auth'

// GET requiere sesión de admin (vista de tarjetas en el panel).
// POST es público: el empleado puede crear/encontrar la tarjeta de un cliente al sellar.
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
  // findOrCreate: busca por teléfono normalizado; si no existe, crea la tarjeta.
  const { card, isNew } = await findOrCreate(name, phone)
  return Response.json(card, { status: isNew ? 201 : 200 })
}
