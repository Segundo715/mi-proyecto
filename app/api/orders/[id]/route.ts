import { NextRequest } from 'next/server'
import { updateOrderStatus } from '@/lib/ordersDb'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await req.json()
  const order = updateOrderStatus(id, status)
  if (!order) return Response.json({ error: 'Pedido no encontrado' }, { status: 404 })
  return Response.json(order)
}
