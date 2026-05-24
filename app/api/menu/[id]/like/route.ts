import { getAllMenuItems, updateMenuItem } from '@/lib/menuDb'

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const item = getAllMenuItems().find(i => i.id === id)
  if (!item) return Response.json({ error: 'No encontrado' }, { status: 404 })
  const updated = updateMenuItem(id, { likes: (item.likes ?? 0) + 1 })
  return Response.json(updated)
}
