'use client'

import { FEATURES } from '@/lib/features'

const TABS = [
  { href: '/menu',   label: 'Menú',    emoji: '🍽', key: 'menu',   feature: undefined },
  { href: '/review', label: 'Reseñas', emoji: '⭐', key: 'review', feature: undefined },
  { href: '/loyalty', label: 'Tarjeta', emoji: '☕', key: 'card',   feature: 'loyaltyCard' as const },
] as const

export default function CustomerNav({ active }: { active: 'menu' | 'review' | 'card' }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.4)]"
      style={{ backgroundColor: '#0d0d0d', borderTop: '1px solid #1a1a1a' }}>
      <div className="flex max-w-lg mx-auto">
        {TABS.map(t => {
          const isActive = active === t.key
          const locked = t.feature ? !FEATURES[t.feature].enabled : false
          return (
            <a key={t.key} href={locked ? undefined : t.href}
              onClick={locked ? e => e.preventDefault() : undefined}
              className="flex-1 py-2.5 flex flex-col items-center gap-0.5 relative transition-colors"
              style={{ opacity: locked ? 0.4 : 1, cursor: locked ? 'not-allowed' : 'pointer' }}
            >
              {isActive && !locked && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ backgroundColor: '#B90F45' }} />
              )}
              <span className={`text-2xl transition-transform ${isActive && !locked ? 'scale-110' : ''}`}>
                {t.emoji}
              </span>
              <span className="text-xs font-bold" style={{ color: isActive && !locked ? '#B90F45' : '#6b7280' }}>
                {t.label}
              </span>
              {locked && (
                <span className="absolute -top-0.5 right-1/4 text-[9px] text-white font-black px-1 rounded-full leading-tight"
                  style={{ backgroundColor: '#B90F45' }}>
                  PRO
                </span>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
