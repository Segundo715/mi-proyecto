'use client'

import dynamic from 'next/dynamic'

const LoyaltyCard = dynamic(() => import('./components/LoyaltyCard'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-amber-950 flex items-center justify-center">
      <span className="text-6xl animate-pulse">☕</span>
    </div>
  ),
})

export default function Home() {
  return <LoyaltyCard />
}
