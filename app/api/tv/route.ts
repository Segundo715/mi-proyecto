import { NextRequest } from 'next/server'
import { getActiveSlides, getAllSlides, createSlide } from '@/lib/tvDb'
import { verifySession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const isAdmin = verifySession(req.cookies.get('admin_session')?.value)
  return Response.json(isAdmin ? getAllSlides() : getActiveSlides())
}

export async function POST(req: NextRequest) {
  if (!verifySession(req.cookies.get('admin_session')?.value))
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  const data = await req.json()
  return Response.json(
    createSlide({ ...data, active: data.active ?? true }),
    { status: 201 }
  )
}
