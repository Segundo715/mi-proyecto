import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from './lib/auth'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = req.cookies.get('admin_session')?.value
    if (!verifySession(session)) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
