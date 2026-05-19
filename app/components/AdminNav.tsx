'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { href: '/admin', label: 'Clientes' },
  { href: '/admin/menu', label: 'Menú' },
  { href: '/admin/reviews', label: 'Reseñas' },
  { href: '/admin/tv', label: 'TV' },
]

export default function AdminNav() {
  const router = useRouter()
  const [pathname, setPathname] = useState('')

  useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="bg-amber-900 text-white sticky top-0 z-20 shadow">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <span className="font-bold text-base shrink-0">☕ Chubis</span>
        <div className="flex gap-1 flex-wrap">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-white text-amber-900'
                  : 'bg-amber-800 text-white hover:bg-amber-700'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
        <button
          onClick={logout}
          className="text-sm bg-amber-800 hover:bg-amber-700 px-3 py-1 rounded-lg font-medium shrink-0"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
