import { NextRequest } from 'next/server'
import { authenticateAdmin } from '@/lib/adminDb'
import { createSession } from '@/lib/auth'

// Cookie separada de /admin para que las sesiones de Resta3 y del admin principal sean independientes.
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
  // HttpOnly impide que JavaScript del cliente pueda leer la cookie (protección XSS).
  // Max-Age=86400 → sesión válida por 24 horas.
  res.headers.set('Set-Cookie',
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)
  return res
}

// Cierra sesión sobreescribiendo la cookie con Max-Age=0 (eliminación inmediata).
export async function DELETE() {
  const res = Response.json({ ok: true })
  res.headers.set('Set-Cookie',
    `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
  return res
}
