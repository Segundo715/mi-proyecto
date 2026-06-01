import { supabase } from '@/lib/supabase'
import { FEATURES } from '@/lib/features'
import type { FeatureKey } from '@/lib/features'

const CORS = {
  'Access-Control-Allow-Origin': 'https://mi-superadmindrestaurante.vercel.app',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-superadmin-secret',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET() {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'feature_flags')
    .maybeSingle()

  const overrides: Partial<Record<FeatureKey, boolean>> = data?.value
    ? JSON.parse(data.value)
    : {}

  const flags = Object.fromEntries(
    Object.keys(FEATURES).map(k => [k, overrides[k as FeatureKey] ?? true])
  )

  return Response.json(flags, { headers: CORS })
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-superadmin-secret')
  if (secret !== process.env.SUPERADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS })
  }

  const flags = await req.json()
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'feature_flags', value: JSON.stringify(flags) }, { onConflict: 'key' })

  if (error) return Response.json({ error: error.message }, { status: 500, headers: CORS })
  return Response.json({ ok: true }, { headers: CORS })
}
