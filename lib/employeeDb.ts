import { supabase } from './supabase'
import { createHash } from 'node:crypto'

export interface EmployeeUser {
  id: string
  name: string
  passwordHash: string
  createdAt: string
}

// Prefijo "emp:" separa los hashes de empleados de los de admins.
// Así, aunque tengan el mismo nombre y contraseña, sus hashes son distintos.
function hashPassword(name: string, password: string): string {
  const secret = process.env.ADMIN_SECRET ?? 'dev-secret'
  return createHash('sha256').update(`emp:${secret}:${name.toLowerCase()}:${password}`).digest('hex')
}

function toEmployee(row: Record<string, unknown>): EmployeeUser {
  return {
    id: row.id as string,
    name: row.name as string,
    passwordHash: row.password_hash as string,
    createdAt: row.created_at as string,
  }
}

export async function createEmployee(name: string, password: string): Promise<EmployeeUser | null> {
  const { data: existing } = await supabase.from('employees').select('id').ilike('name', name).maybeSingle()
  if (existing) return null
  const { data, error } = await supabase.from('employees').insert({
    name: name.trim(),
    password_hash: hashPassword(name, password),
  }).select().single()
  if (error) throw error
  return toEmployee(data)
}

export async function authenticateEmployee(name: string, password: string): Promise<EmployeeUser | null> {
  const hash = hashPassword(name, password)
  const { data } = await supabase.from('employees')
    .select('*').ilike('name', name).eq('password_hash', hash).maybeSingle()
  return data ? toEmployee(data) : null
}

export async function getEmployeeById(id: string): Promise<EmployeeUser | undefined> {
  const { data } = await supabase.from('employees').select('*').eq('id', id).maybeSingle()
  return data ? toEmployee(data) : undefined
}
