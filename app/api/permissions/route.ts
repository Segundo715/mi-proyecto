import { supabase } from '@/lib/supabase'

async function getPerms(baseKey: string): Promise<Record<string, boolean>> {
  const rid = process.env.NEXT_PUBLIC_RESTAURANT_ID
  const keys = rid ? [`${baseKey}_${rid}`, baseKey] : [baseKey]
  for (const key of keys) {
    const { data } = await supabase.from('settings').select('value').eq('key', key).maybeSingle()
    if (data?.value) return JSON.parse(data.value)
  }
  return {}
}

export async function GET() {
  const [employee, user] = await Promise.all([
    getPerms('employee_permissions'),
    getPerms('user_permissions'),
  ])
  return Response.json({ employee, user }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
  })
}
