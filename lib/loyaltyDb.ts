import { supabase } from './supabase'

export interface LoyaltyCard {
  id: string
  name: string
  phone: string
  visits: number
  active: boolean
  expiresAt?: string
  registeredAt: string
  stamps: { timestamp: string; visitsAfter: number }[]
}

function toCard(row: Record<string, unknown>): LoyaltyCard {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: (row.phone as string) ?? '',
    visits: (row.visits as number) ?? 0,
    active: row.active as boolean,
    expiresAt: row.expires_at as string | undefined,
    registeredAt: row.registered_at as string,
    stamps: (row.stamps as LoyaltyCard['stamps']) ?? [],
  }
}

function expiryDate(): string {
  return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
}

export async function getAllCards(): Promise<LoyaltyCard[]> {
  const { data } = await supabase.from('loyalty_cards').select('*').order('registered_at', { ascending: false })
  return (data ?? []).map(toCard)
}

export async function getCard(id: string): Promise<LoyaltyCard | undefined> {
  const { data } = await supabase.from('loyalty_cards').select('*').eq('id', id).maybeSingle()
  return data ? toCard(data) : undefined
}

export async function findByPhone(phone: string): Promise<LoyaltyCard | null> {
  const clean = phone.replace(/\D/g, '')
  const { data: all } = await supabase.from('loyalty_cards').select('*')
  const found = (all ?? []).find((r: Record<string, unknown>) =>
    (r.phone as string).replace(/\D/g, '') === clean
  )
  return found ? toCard(found) : null
}

export async function findOrCreate(name: string, phone: string): Promise<{ card: LoyaltyCard; isNew: boolean }> {
  const existing = await findByPhone(phone)
  if (existing) return { card: existing, isNew: false }

  const { data, error } = await supabase.from('loyalty_cards').insert({
    name: name.trim(),
    phone: phone.trim(),
    visits: 0,
    active: true,
    expires_at: expiryDate(),
    stamps: [],
  }).select().single()
  if (error) throw error
  return { card: toCard(data), isNew: true }
}

export async function addStamp(id: string): Promise<LoyaltyCard | null> {
  const { data: row } = await supabase.from('loyalty_cards').select('*').eq('id', id).maybeSingle()
  if (!row) return null
  const c = toCard(row)
  if (!c.active || c.visits >= 5) return c
  const newStamps = [...c.stamps, { timestamp: new Date().toISOString(), visitsAfter: c.visits + 1 }]
  const { data } = await supabase.from('loyalty_cards')
    .update({ visits: c.visits + 1, stamps: newStamps, expires_at: expiryDate() })
    .eq('id', id).select().single()
  return data ? toCard(data) : null
}

export async function redeemCoffee(id: string): Promise<LoyaltyCard | null> {
  const { data } = await supabase.from('loyalty_cards')
    .update({ visits: 0, expires_at: expiryDate() })
    .eq('id', id).select().single()
  return data ? toCard(data) : null
}

export async function deleteCard(id: string): Promise<boolean> {
  const { error } = await supabase.from('loyalty_cards').delete().eq('id', id)
  return !error
}

export async function deactivateCard(id: string): Promise<LoyaltyCard | null> {
  const { data } = await supabase.from('loyalty_cards').update({ active: false }).eq('id', id).select().single()
  return data ? toCard(data) : null
}

export async function activateCard(id: string): Promise<LoyaltyCard | null> {
  const { data } = await supabase.from('loyalty_cards')
    .update({ active: true, expires_at: expiryDate() })
    .eq('id', id).select().single()
  return data ? toCard(data) : null
}
