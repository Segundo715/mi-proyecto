'use client'

const TABS = [
  { href: '/menu',   label: 'Menú',   emoji: '🍽', key: 'menu'   },
  { href: '/review', label: 'Reseña', emoji: '⭐', key: 'review' },
  { href: '/',       label: 'Tarjeta',emoji: '☕', key: 'card'   },
] as const

export default function CustomerNav({ active }: { active: 'menu' | 'review' | 'card' }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-amber-100 flex">
      {TABS.map(t => (
        <a key={t.key} href={t.href}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors ${
            active === t.key ? 'text-amber-700' : 'text-gray-400'
          }`}
        >
          <span className="text-2xl">{t.emoji}</span>
          <span>{t.label}</span>
        </a>
      ))}
    </div>
  )
}
