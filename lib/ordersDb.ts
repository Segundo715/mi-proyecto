import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

export interface OrderItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  customerName: string
  tableNumber?: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered'
  createdAt: string
  notes?: string
}

const DB_PATH = join(process.cwd(), 'data', 'orders.json')

function load(): Order[] {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(DB_PATH)) return []
  try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')) } catch { return [] }
}

function save(rows: Order[]) {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(DB_PATH, JSON.stringify(rows, null, 2))
}

export function getAllOrders(): Order[] {
  return load().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
  const rows = load()
  const order: Order = { ...data, id: randomUUID(), status: 'pending', createdAt: new Date().toISOString() }
  rows.push(order)
  save(rows)
  return order
}

export function updateOrderStatus(id: string, status: Order['status']): Order | null {
  const rows = load()
  const i = rows.findIndex(o => o.id === id)
  if (i === -1) return null
  rows[i].status = status
  save(rows)
  return rows[i]
}
