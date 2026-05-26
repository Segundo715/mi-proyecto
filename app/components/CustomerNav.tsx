'use client'

import { FEATURES } from '@/lib/features'

type IconProps = { className?: string }

function MenuIcon({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v7a3 3 0 0 0 3 3v8M6 3v7M9 3v7M18 3c-1.5 1-2 3-2 6s.5 4 2 5v7" />
    </svg>
  )
}

function ReviewIcon({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z" />
    </svg>
  )
}

function CardIcon({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h12v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
      <path d="M16 9h2a2 2 0 0 1 0 4h-2" />
      <path d="M7 2v2M10 2v2M13 2v2" />
    </svg>
  )
}

function LogoutIcon({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

const TABS = [
  { href: '/menu',   label: 'Menú',    Icon: MenuIcon,   key: 'menu',   feature: undefined },
  { href: '/review', label: 'Reseñas', Icon: ReviewIcon, key: 'review', feature: undefined },
  { href: '/card',    label: 'Tarjeta', Icon: CardIcon,   key: 'card',   feature: 'loyaltyCard' as const },
] as const

function logout() {
  localStorage.removeItem('loyalty_id')
  localStorage.removeItem('loyalty_pending_id')
  localStorage.removeItem('loyalty_card_id')
  window.location.href = '/loyalty'
}

export default function CustomerNav({ active }: { active: 'menu' | 'review' | 'card' }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden max-w-lg mx-auto"
      style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a' }}>
      <div className="flex">
        {TABS.map(t => {
          const isActive = active === t.key
          const locked = t.feature ? !FEATURES[t.feature].enabled : false
          const color = isActive && !locked ? 'text-[#B90F45]' : 'text-[#6b7280]'
          return (
            <a key={t.key} href={locked ? undefined : t.href}
              onClick={locked ? e => e.preventDefault() : undefined}
              className={`group flex-1 py-2.5 flex flex-col items-center gap-0.5 relative transition-colors ${locked ? '' : 'hover:[&_*]:text-[#B90F45]'} ${color}`}
              style={{ opacity: locked ? 0.4 : 1, cursor: locked ? 'not-allowed' : 'pointer' }}
            >
              {isActive && !locked && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ backgroundColor: '#B90F45' }} />
              )}
              <t.Icon className={`transition-transform ${isActive && !locked ? 'scale-110' : ''}`} />
              <span className="text-xs font-bold">{t.label}</span>
              {locked && (
                <span className="absolute -top-0.5 right-1/4 text-[9px] text-white font-black px-1 rounded-full leading-tight"
                  style={{ backgroundColor: '#B90F45' }}>
                  PRO
                </span>
              )}
            </a>
          )
        })}
        <button type="button" onClick={logout}
          className="group flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors text-[#6b7280] hover:[&_*]:text-[#B90F45]"
          style={{ cursor: 'pointer' }}
        >
          <LogoutIcon />
          <span className="text-xs font-bold">Salir</span>
        </button>
      </div>
    </div>
  )
}
