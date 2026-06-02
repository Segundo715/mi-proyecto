import { supabase } from '@/lib/supabase'

async function getPerms(key: string): Promise<Record<string, boolean>> {
  const { data } = await supabase.from('settings').select('value').eq('key', key).maybeSingle()
  return data?.value ? JSON.parse(data.value) : {}
}

export async function GET() {
  const [employee, user] = await Promise.all([
    getPerms('employee_permissions'),
    getPerms('user_permissions'),
  ])
  return Response.json({ employee, user })
}
