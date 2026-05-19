import { NextRequest } from 'next/server'
import { getAllOrders, createOrder } from '@/lib/ordersDb'

export async function GET() {
  return Response.json(getAllOrders())
}

export async function POST(req: NextRequest) {
  const { customerName, tableNumber, items, total, notes } = await req.json()
  if (!customerName?.trim() || !Array.isArray(items) || items.length === 0)
    return Response.json({ error: 'Nombre e items requeridos' }, { status: 400 })
  const order = createOrder({ customerName: customerName.trim(), tableNumber, items, total: total ?? 0, notes })
  return Response.json(order, { status: 201 })
}
