import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { randomUUID, createHash } from 'node:crypto'

export interface AdminUser {
  id: string
  name: string
  passwordHash: string
  createdAt: string
}

const DB_PATH = join(process.cwd(), 'data', 'admins.json')

function load(): AdminUser[] {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(DB_PATH)) return []
  try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')) } catch { return [] }
}

function save(rows: AdminUser[]) {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(DB_PATH, JSON.stringify(rows, null, 2))
}

function hashPassword(name: string, password: string): string {
  const secret = process.env.ADMIN_SECRET ?? 'dev-secret'
  return createHash('sha256').update(`${secret}:${name.toLowerCase()}:${password}`).digest('hex')
}

export function createAdmin(name: string, password: string): AdminUser | null {
  const rows = load()
  if (rows.find(a => a.name.toLowerCase() === name.toLowerCase())) return null
  const admin: AdminUser = {
    id: randomUUID(),
    name: name.trim(),
    passwordHash: hashPassword(name, password),
    createdAt: new Date().toISOString(),
  }
  rows.push(admin)
  save(rows)
  return admin
}

export function authenticateAdmin(name: string, password: string): AdminUser | null {
  const rows = load()
  const hash = hashPassword(name, password)
  return rows.find(a => a.name.toLowerCase() === name.toLowerCase() && a.passwordHash === hash) ?? null
}

export function getAdminById(id: string): AdminUser | undefined {
  return load().find(a => a.id === id)
}
