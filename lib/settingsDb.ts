import { supabase } from './supabase'

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const { data } = await supabase.from('settings').select('value').eq('key', key).maybeSingle()
  return data?.value ?? fallback
}

export async function setSetting(key: string, value: string): Promise<void> {
  await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' })
}
