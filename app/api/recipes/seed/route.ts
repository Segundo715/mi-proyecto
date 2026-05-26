import { NextRequest } from 'next/server'
import { getAllRecipes, updateRecipe, createRecipe } from '@/lib/recipeDb'
import { verifySession } from '@/lib/auth'
import catalog from '@/data/recipes.json'

interface CatalogItem {
  name: string
  description: string
  category: string
  imageUrl: string
  ingredients: string[]
  steps: string[]
}

// Conecta el catálogo de recetas (data/recipes.json) con la BD de /admin/recipes:
//  - Rellena ingredientes/pasos en recetas existentes que los tengan vacíos.
//  - CREA las recetas del catálogo que aún no existan (por nombre).
// Nunca sobrescribe ingredientes/pasos ya capturados.
export async function POST(req: NextRequest) {
  if (!verifySession(req.cookies.get('admin_session')?.value))
    return Response.json({ error: 'No autorizado' }, { status: 401 })

  const recipes = await getAllRecipes()
  const existingByName = new Map(recipes.map(r => [r.name.toLowerCase(), r]))

  let updated = 0
  let created = 0

  for (const item of catalog as CatalogItem[]) {
    const existing = existingByName.get(item.name.toLowerCase())

    if (existing) {
      const patch: { ingredients?: string[]; steps?: string[] } = {}
      if (existing.ingredients.length === 0 && item.ingredients.length > 0) patch.ingredients = item.ingredients
      if (existing.steps.length === 0 && item.steps.length > 0) patch.steps = item.steps
      if (Object.keys(patch).length > 0) {
        await updateRecipe(existing.id, patch)
        updated++
      }
    } else {
      await createRecipe({
        name: item.name,
        description: item.description,
        category: item.category,
        ingredients: item.ingredients,
        steps: item.steps,
        imageUrl: item.imageUrl || undefined,
      })
      created++
    }
  }

  return Response.json({ ok: true, updated, created })
}
