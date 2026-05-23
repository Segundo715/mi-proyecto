import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  available: boolean
  likes: number
  createdAt: string
}

const DB_PATH = join(process.cwd(), 'data', 'menu.json')

function load(): MenuItem[] {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(DB_PATH)) return []
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function save(rows: MenuItem[]) {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(DB_PATH, JSON.stringify(rows, null, 2))
}

export const getAllMenuItems = () => load()

export function createMenuItem(data: Omit<MenuItem, 'id' | 'createdAt'>): MenuItem {
  const rows = load()
  const item: MenuItem = { ...data, likes: data.likes ?? 0, id: randomUUID(), createdAt: new Date().toISOString() }
  rows.push(item)
  save(rows)
  return item
}

export function updateMenuItem(
  id: string,
  data: Partial<Omit<MenuItem, 'id' | 'createdAt'>>
): MenuItem | null {
  const rows = load()
  const i = rows.findIndex(r => r.id === id)
  if (i === -1) return null
  rows[i] = { ...rows[i], ...data }
  save(rows)
  return rows[i]
}

export function deleteMenuItem(id: string): boolean {
  const rows = load()
  const i = rows.findIndex(r => r.id === id)
  if (i === -1) return false
  rows.splice(i, 1)
  save(rows)
  return true
}
