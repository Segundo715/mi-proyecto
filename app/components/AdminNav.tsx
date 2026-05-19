'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { href: '/admin',           label: '🔍 Sellar',   exact: true },
  { href: '/admin/orders',    label: '📋 Pedidos'              },
  { href: '/admin/menu',      label: '🍽 Menú'                 },
  { href: '/admin/reviews',   label: '⭐ Reseñas'              },
  { href: '/admin/tv',        label: '📺 TV'                   },
  { href: '/admin/customers', label: '👥 Clientes'             },
]

export default function AdminNav() {
  const router = useRouter()
  const [pathname, setPathname] = useState('')
  const [open, setOpen] = useState(false)

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

  const currentLabel = NAV_LINKS.find(l => isActive(l.href, l.exact))?.label ?? '☕ Chubis'

  return (
    <>
      <div className="bg-amber-900 text-white sticky top-0 z-20 shadow">
        <div className="max-w-4xl mx-auto px-3 py-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <span className="text-xl leading-none">☰</span>
            <span>{currentLabel}</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="text-xs bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-lg font-medium"
          >
            Salir
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-64 bg-amber-900 text-white h-full flex flex-col shadow-2xl">
            <div className="px-4 py-4 flex items-center justify-between border-b border-amber-800">
              <span className="font-bold text-lg">☕ Chubis Admin</span>
              <button type="button" onClick={() => setOpen(false)} className="text-amber-300 text-2xl leading-none">×</button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href, link.exact)
                      ? 'bg-white text-amber-900 font-bold'
                      : 'text-amber-100 hover:bg-amber-800 active:bg-amber-700'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="p-3 border-t border-amber-800">
              <button
                type="button"
                onClick={logout}
                className="w-full text-sm bg-amber-800 hover:bg-amber-700 px-4 py-2.5 rounded-xl font-medium text-left"
              >
                Salir →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
