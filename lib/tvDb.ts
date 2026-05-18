import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

export interface TVSlide {
  id: string
  title: string
  subtitle?: string
  price?: string
  imageUrl?: string
  order: number
  active: boolean
  createdAt: string
}

const DB_PATH = join(process.cwd(), 'data', 'tv.json')

function load(): TVSlide[] {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(DB_PATH)) return []
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function save(rows: TVSlide[]) {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(DB_PATH, JSON.stringify(rows, null, 2))
}

export const getAllSlides = () => [...load()].sort((a, b) => a.order - b.order)
export const getActiveSlides = () => getAllSlides().filter(s => s.active)

export function createSlide(data: Omit<TVSlide, 'id' | 'createdAt' | 'order'>): TVSlide {
  const rows = load()
  const slide: TVSlide = {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    order: rows.length,
  }
  rows.push(slide)
  save(rows)
  return slide
}

export function updateSlide(id: string, data: Partial<TVSlide>): TVSlide | null {
  const rows = load()
  const i = rows.findIndex(r => r.id === id)
  if (i === -1) return null
  rows[i] = { ...rows[i], ...data }
  save(rows)
  return rows[i]
}

export function deleteSlide(id: string): boolean {
  const rows = load()
  const i = rows.findIndex(r => r.id === id)
  if (i === -1) return false
  rows.splice(i, 1)
  save(rows)
  return true
}
