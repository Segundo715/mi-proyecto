import { createHmac } from 'node:crypto'

const SECRET = process.env.ADMIN_SECRET ?? 'dev-secret'
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123'

export function checkPassword(pwd: string): boolean {
  return pwd === PASSWORD
}

export function createSession(): string {
  return createHmac('sha256', SECRET).update(PASSWORD).digest('hex')
}

export function verifySession(session?: string): boolean {
  return !!session && session === createSession()
}
