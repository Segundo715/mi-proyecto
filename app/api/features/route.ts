import { supabase } from '@/lib/supabase'
import { getFeatureFlags } from '@/lib/features'

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
const CORS = {
  'Access-Control-Allow-Origin': 'https://mi-superadmindrestaurante.vercel.app',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  ...NO_CACHE,
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET() {
  const flags = await getFeatureFlags()
  return Response.json(flags, { headers: CORS })
}

export async function POST(req: Request) {
  const body = await req.json()
  const settingsKey: string = body.settingsKey ?? 'feature_flags'
  const flags = body.flags ?? body

  const { error } = await supabase
    .from('settings')
    .upsert({ key: settingsKey, value: JSON.stringify(flags) }, { onConflict: 'key' })

  if (error) return Response.json({ error: error.message }, { status: 500, headers: CORS })
  return Response.json({ ok: true }, { headers: CORS })
}
