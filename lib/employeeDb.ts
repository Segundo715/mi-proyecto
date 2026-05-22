import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { randomUUID, createHash } from 'node:crypto'

export interface EmployeeUser {
  id: string
  name: string
  passwordHash: string
  createdAt: string
}

const DB_PATH = join(process.cwd(), 'data', 'employees.json')

function load(): EmployeeUser[] {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(DB_PATH)) return []
  try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')) } catch { return [] }
}

function save(rows: EmployeeUser[]) {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(DB_PATH, JSON.stringify(rows, null, 2))
}

function hashPassword(name: string, password: string): string {
  const secret = process.env.ADMIN_SECRET ?? 'dev-secret'
  return createHash('sha256').update(`emp:${secret}:${name.toLowerCase()}:${password}`).digest('hex')
}

export function createEmployee(name: string, password: string): EmployeeUser | null {
  const rows = load()
  if (rows.find(e => e.name.toLowerCase() === name.toLowerCase())) return null
  const employee: EmployeeUser = {
    id: randomUUID(),
    name: name.trim(),
    passwordHash: hashPassword(name, password),
    createdAt: new Date().toISOString(),
  }
  rows.push(employee)
  save(rows)
  return employee
}

export function authenticateEmployee(name: string, password: string): EmployeeUser | null {
  const rows = load()
  const hash = hashPassword(name, password)
  return rows.find(e => e.name.toLowerCase() === name.toLowerCase() && e.passwordHash === hash) ?? null
}

export function getEmployeeById(id: string): EmployeeUser | undefined {
  return load().find(e => e.id === id)
}
