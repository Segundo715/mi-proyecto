import { NextRequest } from 'next/server'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { verifySession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!verifySession(req.cookies.get('admin_session')?.value))
    return Response.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No se recibió ningún archivo' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const ext = extname(file.name) || '.jpg'
  const filename = `${randomUUID()}${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'menu')
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })
  writeFileSync(join(uploadDir, filename), Buffer.from(bytes))

  return Response.json({ url: `/uploads/menu/${filename}` })
}
