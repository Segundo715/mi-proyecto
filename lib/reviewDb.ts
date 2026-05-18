import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

export interface Review {
  id: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
  published: boolean
  bad: boolean
}

const DB_PATH = join(process.cwd(), 'data', 'reviews.json')

function load(): Review[] {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(DB_PATH)) return []
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function save(rows: Review[]) {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(DB_PATH, JSON.stringify(rows, null, 2))
}

export const getAllReviews = () => load()
export const getPublishedReviews = () => load().filter(r => r.published)

export function createReview(
  data: Pick<Review, 'customerName' | 'rating' | 'comment'>
): Review {
  const rows = load()
  const review: Review = {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    bad: data.rating <= 3,
    published: data.rating >= 4,
  }
  rows.push(review)
  save(rows)
  return review
}

export function updateReview(id: string, data: Partial<Review>): Review | null {
  const rows = load()
  const i = rows.findIndex(r => r.id === id)
  if (i === -1) return null
  rows[i] = { ...rows[i], ...data }
  save(rows)
  return rows[i]
}

export function deleteReview(id: string): boolean {
  const rows = load()
  const i = rows.findIndex(r => r.id === id)
  if (i === -1) return false
  rows.splice(i, 1)
  save(rows)
  return true
}
