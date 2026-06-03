import { NextRequest } from 'next/server'
import { authenticateAdmin } from '@/lib/adminDb'
import { createSession } from '@/lib/auth'

const COOKIE = 'resta3_session'

export async function POST(req: NextRequest) {
  const { name, password } = await req.json()
  if (!name?.trim() || !password)
    return Response.json({ error: 'Datos incompletos' }, { status: 400 })
  const admin = await authenticateAdmin(name.trim(), password)
  if (!admin)
    return Response.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
  const token = createSession(admin.id)
  const res = Response.json({ ok: true, name: admin.name })
  res.headers.set('Set-Cookie',
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)
  return res
}

export async function DELETE() {
  const res = Response.json({ ok: true })
  res.headers.set('Set-Cookie',
    `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
  return res
}
