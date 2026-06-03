import { supabase } from '@/lib/supabase'

const RESTA3_FEATURES = ['r3_tpv','r3_mesas','r3_cocina','r3_inventario','r3_compras','r3_empleados','r3_reportes']

export async function GET() {
  const { data } = await supabase
    .from('settings').select('value').eq('key', 'feature_flags_resta3').maybeSingle()

  const overrides: Record<string, boolean> = data?.value ? JSON.parse(data.value) : {}
  const flags = Object.fromEntries(RESTA3_FEATURES.map(k => [k, overrides[k] ?? true]))

  return Response.json(flags, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
  })
}
