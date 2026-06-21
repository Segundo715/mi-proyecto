import { createClient } from '@supabase/supabase-js'

export interface BirthdayRegistration {
  id: string
  name: string
  phone: string
  birthdate: string
  createdAt: string
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

function toReg(row: Record<string, unknown>): BirthdayRegistration {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    birthdate: row.birthdate as string,
    createdAt: row.created_at as string,
  }
}

export async function getAllBirthdays(): Promise<BirthdayRegistration[]> {
  const { data } = await getClient()
    .from('birthday_registrations')
    .select('*')
    .order('birthdate')
  return (data ?? []).map(toReg)
}

export async function createBirthday(
  name: string,
  phone: string,
  birthdate: string,
): Promise<BirthdayRegistration> {
  const { data, error } = await getClient()
    .from('birthday_registrations')
    .insert({ name, phone, birthdate })
    .select()
    .single()
  if (error) throw error
  return toReg(data as Record<string, unknown>)
}

export async function deleteBirthday(id: string): Promise<void> {
  await getClient().from('birthday_registrations').delete().eq('id', id)
}
