import { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import demoMenu from '@/lib/demo-menu.json'

const RID = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'default'

export async function POST(req: NextRequest) {
  if (!verifySession(req.cookies.get('admin_session')?.value))
    return Response.json({ error: 'No autorizado' }, { status: 401 })

  let created = 0
  let skipped = 0
  let imaged = 0

  for (const item of demoMenu) {
    const { data: existing } = await supabase
      .from('menu_items')
      .select('id, image_url')
      .eq('restaurant_id', RID)
      .eq('name', item.name)
      .maybeSingle()

    if (existing) {
      // Si el platillo ya existe pero perdió su foto, se le vuelve a poner.
      if (!existing.image_url && item.imageUrl) {
        await supabase.from('menu_items').update({ image_url: item.imageUrl }).eq('id', existing.id)
        imaged++
      }
      skipped++
      continue
    }

    await supabase.from('menu_items').insert({
      name:          item.name,
      description:   item.description,
      price:         item.price,
      category:      item.category,
      image_url:     item.imageUrl ?? null,
      available:     item.available,
      likes:         0,
      restaurant_id: RID,
    })
    created++
  }

  return Response.json({ ok: true, created, skipped, imaged })
}
