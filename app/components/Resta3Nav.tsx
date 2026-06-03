'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const LINKS = [
  { href: '/resta3',           icon: 'dashboard', label: 'Dashboard',    exact: true },
  { href: '/resta3/tpv',       icon: 'tpv',       label: 'TPV / Caja' },
  { href: '/resta3/mesas',     icon: 'mesas',      label: 'Mesas' },
  { href: '/resta3/cocina',    icon: 'cocina',     label: 'Cocina' },
  { href: '/resta3/inventario',icon: 'inventario', label: 'Inventario' },
  { href: '/resta3/compras',   icon: 'compras',    label: 'Compras' },
  { href: '/resta3/empleados', icon: 'empleados',  label: 'Empleados' },
  { href: '/resta3/reportes',  icon: 'reportes',   label: 'Reportes' },
]

const ICONS: Record<string, string> = {
  dashboard:  '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  tpv:        '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  mesas:      '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>',
  cocina:     '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
  inventario: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  compras:    '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  empleados:  '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  reportes:   '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  logout:     '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
}

function NavIcon({ name }: { name: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: ICONS[name] ?? '' }} />
  )
}

export default function Resta3Nav() {
  const router = useRouter()
  const [pathname, setPathname] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => { setPathname(window.location.pathname) }, [])

  async function logout() {
    await fetch('/api/resta3/auth', { method: 'DELETE' })
    router.push('/resta3/login')
  }

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const sidebar = (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#0f1117', borderRight: '1px solid rgba(245,158,11,0.1)' }}>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(245,158,11,0.1)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }}>R</div>
        <div>
          <div className="font-black text-base tracking-tight" style={{ color: '#f1f5f9' }}>
            RESTA<span style={{ color: '#f59e0b' }}>3</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#475569' }}>
            Gestión
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {LINKS.map(link => {
          const active = isActive(link.href, link.exact)
          return (
            <a key={link.href} href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={active
                ? { background: 'linear-gradient(135deg,#f59e0b22,#d9770611)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }
                : { color: '#64748b', border: '1px solid transparent' }}>
              <NavIcon name={link.icon} />
              <span>{link.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />}
            </a>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(245,158,11,0.1)' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }}>A</div>
          <div>
            <div className="text-xs font-bold" style={{ color: '#f1f5f9' }}>Administrador</div>
            <div className="text-[10px]" style={{ color: '#475569' }}>RESTA3</div>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: '#475569' }}>
          <NavIcon name="logout" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Topbar mobile */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: '#0f1117', borderBottom: '1px solid rgba(245,158,11,0.1)' }}>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }}>R</div>
          <span className="font-bold text-sm" style={{ color: '#f1f5f9' }}>RESTA3</span>
        </button>
        <button onClick={logout} className="text-xs px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: '#1a1d27', color: '#64748b', border: '1px solid rgba(245,158,11,0.1)' }}>
          Salir
        </button>
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 z-40 w-[220px]">
        {sidebar}
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="relative w-64 h-full shadow-2xl">{sidebar}</aside>
        </div>
      )}
    </>
  )
}
