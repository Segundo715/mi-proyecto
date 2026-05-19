'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { href: '/admin', label: 'Sellar', exact: true },
  { href: '/admin/orders', label: 'Pedidos' },
  { href: '/admin/menu', label: 'Menú' },
  { href: '/admin/reviews', label: 'Reseñas' },
  { href: '/admin/tv', label: 'TV' },
  { href: '/admin/customers', label: 'Clientes' },
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

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="bg-amber-900 text-white sticky top-0 z-20 shadow">
      <div className="max-w-4xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
        <span className="font-bold text-sm shrink-0">☕ Chubis</span>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive(link.href, link.exact)
                  ? 'bg-white text-amber-900'
                  : 'bg-amber-800 text-white hover:bg-amber-700'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-xs bg-amber-800 hover:bg-amber-700 px-2.5 py-1 rounded-lg font-medium shrink-0"
        >
          Salir
        </button>
      </div>
    </div>
  )
}
