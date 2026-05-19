'use client'

export default function CustomerNav({ active }: { active: 'menu' | 'card' }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-amber-100 flex">
      <a
        href="/menu"
        className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors ${
          active === 'menu' ? 'text-amber-700' : 'text-gray-400'
        }`}
      >
        <span className="text-2xl">🍽</span>
        <span>Menú</span>
      </a>
      <a
        href="/"
        className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors ${
          active === 'card' ? 'text-amber-700' : 'text-gray-400'
        }`}
      >
        <span className="text-2xl">☕</span>
        <span>Mi tarjeta</span>
      </a>
    </div>
  )
}
