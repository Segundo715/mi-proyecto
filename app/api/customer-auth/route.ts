import { NextRequest } from 'next/server'
import { createCustomerAccount, authenticateCustomer } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { action, name, password } = await req.json()

  if (!name?.trim() || !password)
    return Response.json({ error: 'Nombre y contraseña requeridos' }, { status: 400 })

  if (action === 'register') {
    const customer = createCustomerAccount(name.trim(), password)
    if (!customer)
      return Response.json({ error: 'Ese nombre ya está registrado' }, { status: 409 })
    return Response.json(customer, { status: 201 })
  }

  const customer = authenticateCustomer(name.trim(), password)
  if (!customer)
    return Response.json({ error: 'Nombre o contraseña incorrectos' }, { status: 401 })

  return Response.json(customer)
}
