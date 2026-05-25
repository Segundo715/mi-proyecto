import { NextRequest } from 'next/server'
import { extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { verifySession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  if (!verifySession(req.cookies.get('admin_session')?.value))
    return Response.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No se recibió ningún archivo' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const ext = extname(file.name) || '.jpg'
  const filename = `${randomUUID()}${ext}`
  const storagePath = `tv/${filename}`

  const { error } = await supabase.storage.from('uploads').upload(storagePath, Buffer.from(bytes), {
    contentType: file.type || 'image/jpeg',
    upsert: true,
  })
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${storagePath}`
  return Response.json({ url })
}
