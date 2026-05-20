'use client'

const TABS = [
  { href: '/menu',   label: 'Menú',    emoji: '🍽', key: 'menu'   },
  { href: '/review', label: 'Reseñas', emoji: '⭐', key: 'review' },
  { href: '/',       label: 'Tarjeta', emoji: '☕', key: 'card'   },
] as const

export default function CustomerNav({ active }: { active: 'menu' | 'review' | 'card' }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div className="flex max-w-lg mx-auto">
        {TABS.map(t => {
          const isActive = active === t.key
          return (
            <a key={t.key} href={t.href}
              className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors relative ${
                isActive ? 'text-amber-800' : 'text-gray-400 active:text-gray-600'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-700 rounded-full" />
              )}
              <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : ''}`}>{t.emoji}</span>
              <span className={`text-xs font-bold ${isActive ? 'text-amber-800' : 'text-gray-400'}`}>{t.label}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
