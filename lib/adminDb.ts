import { supabase } from './supabase'
import { createHash } from 'node:crypto'

export interface AdminUser {
  id: string
  name: string
  passwordHash: string
  createdAt: string
}

function hashPassword(name: string, password: string): string {
  const secret = process.env.ADMIN_SECRET ?? 'dev-secret'
  return createHash('sha256').update(`${secret}:${name.toLowerCase()}:${password}`).digest('hex')
}

function toAdmin(row: Record<string, unknown>): AdminUser {
  return {
    id: row.id as string,
    name: row.name as string,
    passwordHash: row.password_hash as string,
    createdAt: row.created_at as string,
  }
}

export async function createAdmin(name: string, password: string): Promise<AdminUser | null> {
  const { data: existing } = await supabase.from('admins').select('id').ilike('name', name).maybeSingle()
  if (existing) return null
  const { data, error } = await supabase.from('admins').insert({
    name: name.trim(),
    password_hash: hashPassword(name, password),
  }).select().single()
  if (error) throw error
  return toAdmin(data)
}

export async function authenticateAdmin(name: string, password: string): Promise<AdminUser | null> {
  const hash = hashPassword(name, password)
  const { data } = await supabase.from('admins')
    .select('*').ilike('name', name).eq('password_hash', hash).maybeSingle()
  return data ? toAdmin(data) : null
}

export async function getAdminById(id: string): Promise<AdminUser | undefined> {
  const { data } = await supabase.from('admins').select('*').eq('id', id).maybeSingle()
  return data ? toAdmin(data) : undefined
}

export interface AdminListItem {
  id: string
  name: string
  createdAt: string
}

export async function listAdmins(): Promise<AdminListItem[]> {
  const { data } = await supabase.from('admins')
    .select('id,name,created_at').order('created_at', { ascending: true })
  return (data ?? []).map(r => ({
    id: r.id as string,
    name: r.name as string,
    createdAt: r.created_at as string,
  }))
}

export async function countAdmins(): Promise<number> {
  const { count } = await supabase.from('admins').select('id', { count: 'exact', head: true })
  return count ?? 0
}

export async function deleteAdmin(id: string): Promise<void> {
  await supabase.from('admins').delete().eq('id', id)
}
