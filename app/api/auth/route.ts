import { NextRequest } from 'next/server'
import { checkPassword, createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (!checkPassword(password))
    return Response.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  const res = Response.json({ ok: true })
  res.headers.set(
    'Set-Cookie',
    `admin_session=${createSession()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
  )
  return res
}

export async function DELETE() {
  const res = Response.json({ ok: true })
  res.headers.set('Set-Cookie', 'admin_session=; Path=/; HttpOnly; Max-Age=0')
  return res
}
