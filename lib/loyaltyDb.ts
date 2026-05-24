import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

export interface LoyaltyCard {
  id: string
  name: string
  phone: string
  visits: number
  registeredAt: string
  stamps: { timestamp: string; visitsAfter: number }[]
}

const DB_PATH = join(process.cwd(), 'data', 'loyaltyCards.json')

function load(): LoyaltyCard[] {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(DB_PATH)) return []
  try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')) } catch { return [] }
}

function save(rows: LoyaltyCard[]) {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(DB_PATH, JSON.stringify(rows, null, 2))
}

export function getAllCards(): LoyaltyCard[] {
  return load().sort((a, b) => {
    const aT = a.stamps.at(-1)?.timestamp ?? a.registeredAt
    const bT = b.stamps.at(-1)?.timestamp ?? b.registeredAt
    return bT.localeCompare(aT)
  })
}

export function getCard(id: string): LoyaltyCard | undefined {
  return load().find(c => c.id === id)
}

export function findOrCreate(name: string, phone: string): LoyaltyCard {
  const rows = load()
  const clean = phone.replace(/\D/g, '')
  const existing = rows.find(c =>
    c.name.toLowerCase() === name.toLowerCase() &&
    c.phone.replace(/\D/g, '') === clean
  )
  if (existing) return existing
  const card: LoyaltyCard = {
    id: randomUUID(),
    name: name.trim(),
    phone: phone.trim(),
    visits: 0,
    registeredAt: new Date().toISOString(),
    stamps: [],
  }
  rows.push(card)
  save(rows)
  return card
}

export function addStamp(id: string): LoyaltyCard | null {
  const rows = load()
  const i = rows.findIndex(c => c.id === id)
  if (i === -1) return null
  const c = rows[i]
  if (c.visits < 5) {
    c.visits += 1
    c.stamps.push({ timestamp: new Date().toISOString(), visitsAfter: c.visits })
    save(rows)
  }
  return c
}

export function redeemCoffee(id: string): LoyaltyCard | null {
  const rows = load()
  const i = rows.findIndex(c => c.id === id)
  if (i === -1) return null
  rows[i].visits = 0
  save(rows)
  return rows[i]
}

export function deleteCard(id: string): boolean {
  const rows = load()
  const i = rows.findIndex(c => c.id === id)
  if (i === -1) return false
  rows.splice(i, 1)
  save(rows)
  return true
}
