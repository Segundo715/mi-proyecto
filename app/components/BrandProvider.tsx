'use client'

import { createContext, useContext } from 'react'
import type { FeatureFlags } from '@/lib/features'

export interface Brand {
  name: string
  logo: string
  accent: string
  features: FeatureFlags
}

const BrandContext = createContext<Brand>({ name: '', logo: '', accent: '', features: {} as FeatureFlags })

export function useBrand(): Brand {
  return useContext(BrandContext)
}

export default function BrandProvider({ value, children }: { value: Brand; children: React.ReactNode }) {
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}
