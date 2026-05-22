'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FEATURES, type FeatureKey } from '@/lib/features'

interface NavLink {
  href: string; icon: string; label: string; exact?: boolean; feature?: FeatureKey
}

const NAV_LINKS: NavLink[] = [
  { href: '/admin/analytics', icon: 'home',     label: 'Dashboard',    feature: 'analytics' },
  { href: '/admin/orders',    icon: 'orders',   label: 'Pedidos',      feature: 'orders' },
  { href: '/admin/menu',      icon: 'menu',     label: 'Menú',         feature: 'menu' },
  { href: '/admin/reviews',   icon: 'reviews',  label: 'Reseñas',      feature: 'reviews' },
  { href: '/admin',           icon: 'loyalty',  label: 'Fidelización', exact: true },
  { href: '/admin/customers', icon: 'users',    label: 'Clientes',     feature: 'customers' },
  { href: '/admin/tv',        icon: 'tv',       label: 'Pantalla TV',  feature: 'tv' },
]

const ICONS: Record<string, string> = {
  home:    '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  orders:  '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  menu:    '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
  reviews: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  loyalty: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  users:   '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  tv:      '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  logout:  '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
}

function NavIcon({ name }: { name: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: ICONS[name] ?? '' }} />
  )
}

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

  const S = {
    sidebar:   { backgroundColor: '#060911', borderRight: '1px solid rgba(255,255,255,0.07)' },
    card:      { backgroundColor: '#0e1225', border: '1px solid rgba(255,255,255,0.07)' },
    navActive: { backgroundColor: '#00e676', color: '#000' },
    navHover:  { backgroundColor: 'rgba(255,255,255,0.04)' },
    text:      { color: '#eef2f7' },
    sub:       { color: '#6b7a94' },
    accent:    { color: '#00e676' },
    border:    { borderColor: 'rgba(255,255,255,0.07)' },
  }

  return (
    <>
      {/* ===== TOPBAR mobile ===== */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: '#060911', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2.5">
          <div className="flex flex-col gap-1">
            {[0,1,2].map(i => (
              <span key={i} className="block h-0.5 rounded-full w-5" style={{ backgroundColor: '#eef2f7' }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#00e676,#06b6d4)' }}>
              <img src="/logo.png" alt="" className="w-5 h-5 object-contain" />
            </div>
            <span className="font-bold text-sm" style={S.text}>Admin</span>
          </div>
        </button>
        <button type="button" onClick={logout} className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ backgroundColor: '#0e1225', color: '#6b7a94', border: '1px solid rgba(255,255,255,0.07)' }}>
          Salir
        </button>
      </div>

      {/* ===== SIDEBAR desktop ===== */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 w-[240px]" style={S.sidebar}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center relative flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#00e676,#06b6d4)' }}>
            <img src="/logo.png" alt="" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-wide" style={S.text}>NICHO</div>
            <div className="text-[11px] uppercase tracking-widest font-semibold" style={S.sub}>Restaurantes</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-2 space-y-0.5 overflow-y-auto">
          {NAV_LINKS.map(link => {
            const active = isActive(link.href, link.exact)
            const enabled = isEnabled(link.feature)
            return (
              <a key={link.href} href={enabled ? link.href : undefined}
                onClick={enabled ? undefined : e => e.preventDefault()}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={active ? S.navActive : { color: '#6b7a94', opacity: enabled ? 1 : 0.4, cursor: enabled ? 'pointer' : 'not-allowed' }}>
                <NavIcon name={link.icon} />
                <span className="flex-1">{link.label}</span>
                {!enabled && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(0,230,118,0.15)', color: '#00e676' }}>PRO</span>
                )}
              </a>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3 p-2 rounded-lg mb-1"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f6ef7)', color: '#fff' }}>A</div>
            <div>
              <div className="text-sm font-semibold" style={S.text}>Administrador</div>
              <div className="text-xs" style={S.sub}>Panel de control</div>
            </div>
          </div>
          <button type="button" onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ color: '#6b7a94' }}>
            <NavIcon name="logout" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ===== MOBILE DRAWER ===== */}
      <div className={`md:hidden fixed inset-0 z-50 transition-all duration-200 ${open ? 'visible' : 'invisible pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black transition-opacity duration-200 ${open ? 'opacity-60' : 'opacity-0'}`}
          onClick={() => setOpen(false)} />

        <aside className={`relative w-64 h-full flex flex-col shadow-2xl transform transition-transform duration-250 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
          style={S.sidebar}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#00e676,#06b6d4)' }}>
                <img src="/logo.png" alt="" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <div className="font-extrabold text-sm" style={S.text}>NICHO</div>
                <div className="text-[10px] uppercase tracking-widest" style={S.sub}>Restaurantes</div>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#6b7a94' }}>×</button>
          </div>

          <nav className="flex-1 px-2.5 py-2 space-y-0.5 overflow-y-auto">
            {NAV_LINKS.map(link => {
              const active = isActive(link.href, link.exact)
              const enabled = isEnabled(link.feature)
              return (
                <a key={link.href} href={enabled ? link.href : undefined}
                  onClick={enabled ? (() => setOpen(false)) : (e => e.preventDefault())}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium"
                  style={active ? S.navActive : { color: '#6b7a94', opacity: enabled ? 1 : 0.4 }}>
                  <NavIcon name={link.icon} />
                  <span className="flex-1">{link.label}</span>
                  {!enabled && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(0,230,118,0.15)', color: '#00e676' }}>PRO</span>
                  )}
                </a>
              )
            })}
          </nav>

          <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button type="button" onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium"
              style={{ color: '#6b7a94' }}>
              <NavIcon name="logout" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}
