'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FEATURES, type FeatureKey } from '@/lib/features'

interface NavLink {
  href: string
  emoji: string
  label: string
  exact?: boolean
  feature?: FeatureKey
}

const NAV_LINKS: NavLink[] = [
  { href: '/admin',             emoji: '🔍', label: 'Sellar',         exact: true },
  { href: '/admin/orders',      emoji: '📋', label: 'Pedidos',        feature: 'orders' },
  { href: '/admin/menu',        emoji: '🍽', label: 'Menú',           feature: 'menu' },
  { href: '/admin/reviews',     emoji: '⭐', label: 'Reseñas',        feature: 'reviews' },
  { href: '/admin/tv',          emoji: '📺', label: 'Pantalla TV',    feature: 'tv' },
  { href: '/admin/customers',   emoji: '👥', label: 'Clientes',       feature: 'customers' },
  { href: '/admin/analytics',   emoji: '📊', label: 'Analytics',      feature: 'analytics' },
]

function isEnabled(feature?: FeatureKey) {
  if (!feature) return true
  return FEATURES[feature].enabled
}

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

  const current = NAV_LINKS.find(l => isActive(l.href, l.exact))
  const premiumCount = NAV_LINKS.filter(l => l.feature && !isEnabled(l.feature)).length

  return (
    <>
      <div className="bg-amber-900 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2.5 active:opacity-70 transition-opacity"
          >
            <div className="flex flex-col gap-1">
              <span className="block w-5 h-0.5 bg-white rounded-full" />
              <span className="block w-5 h-0.5 bg-white rounded-full" />
              <span className="block w-5 h-0.5 bg-white rounded-full" />
            </div>
            <span className="font-bold text-sm">
              {current ? `${current.emoji} ${current.label}` : '☕ Chubis'}
            </span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="text-xs bg-amber-800 active:bg-amber-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Overlay + sidebar */}
      <div
        className={`fixed inset-0 z-50 flex transition-all duration-200 ${
          open ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-200 ${
            open ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`relative w-72 max-w-[85vw] bg-amber-950 text-white h-full flex flex-col shadow-2xl transform transition-transform duration-250 ease-out ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-5 flex items-center justify-between border-b border-amber-800">
            <div>
              <p className="font-black text-xl tracking-tight">☕ Chubis</p>
              <p className="text-amber-400 text-xs font-medium">Panel de empleado</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center text-amber-300 text-lg leading-none active:bg-amber-700"
            >
              ×
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_LINKS.map(link => {
              const active = isActive(link.href, link.exact)
              const enabled = isEnabled(link.feature)
              return (
                <a
                  key={link.href}
                  href={enabled ? link.href : undefined}
                  onClick={enabled ? undefined : e => e.preventDefault()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    !enabled
                      ? 'opacity-40 cursor-not-allowed text-amber-200'
                      : active
                      ? 'bg-white text-amber-900 shadow-sm'
                      : 'text-amber-200 hover:bg-amber-800 active:bg-amber-700'
                  }`}
                >
                  <span className="text-lg">{link.emoji}</span>
                  <span className="flex-1">{link.label}</span>
                  {!enabled && (
                    <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full">
                      Premium
                    </span>
                  )}
                  {enabled && active && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
                </a>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-amber-800 space-y-1">
            {premiumCount > 0 && (
              <p className="text-amber-500 text-xs text-center mb-2">
                {premiumCount} módulo{premiumCount !== 1 ? 's' : ''} Premium disponible{premiumCount !== 1 ? 's' : ''}
              </p>
            )}
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-amber-300 hover:bg-amber-800 active:bg-amber-700 transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
