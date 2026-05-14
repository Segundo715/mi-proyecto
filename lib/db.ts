import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

export interface Stamp {
  timestamp: string
  visitsAfter: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  visits: number
  confirmed: boolean
  registeredAt: string
  stamps: Stamp[]
}

const DB_PATH = join(process.cwd(), 'data', 'customers.json')

function load(): Customer[] {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(DB_PATH)) return []
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function save(rows: Customer[]): void {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(DB_PATH, JSON.stringify(rows, null, 2))
}

export function getAllCustomers(): Customer[] {
  return load()
}

export function getCustomer(id: string): Customer | undefined {
  return load().find(c => c.id === id)
}

export function createCustomer(name: string, phone: string): Customer {
  const rows = load()
  const customer: Customer = {
    id: randomUUID(),
    name,
    phone,
    visits: 0,
    confirmed: false,
    registeredAt: new Date().toISOString(),
    stamps: [],
  }
  rows.push(customer)
  save(rows)
  return customer
}

export function confirmCustomer(id: string): Customer | null {
  const rows = load()
  const i = rows.findIndex(c => c.id === id)
  if (i === -1) return null
  rows[i].confirmed = true
  save(rows)
  return rows[i]
}

export function addStamp(id: string): Customer | null {
  const rows = load()
  const i = rows.findIndex(c => c.id === id)
  if (i === -1) return null
  const c = rows[i]
  if (!c.confirmed) return null
  if (c.visits < 5) {
    c.visits += 1
    c.stamps.push({ timestamp: new Date().toISOString(), visitsAfter: c.visits })
    save(rows)
  }
  return c
}

export function redeemCoffee(id: string): Customer | null {
  const rows = load()
  const i = rows.findIndex(c => c.id === id)
  if (i === -1) return null
  rows[i].visits = 0
  save(rows)
  return rows[i]
}
