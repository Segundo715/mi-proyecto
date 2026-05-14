import { NextRequest } from 'next/server'
import { getAllCustomers, createCustomer } from '@/lib/db'

export async function GET() {
  return Response.json(getAllCustomers())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const name = (body.name ?? '').trim()
  const phone = (body.phone ?? '').trim()
  if (!name || !phone) {
    return Response.json({ error: 'Nombre y teléfono requeridos' }, { status: 400 })
  }
  return Response.json(createCustomer(name, phone), { status: 201 })
}
