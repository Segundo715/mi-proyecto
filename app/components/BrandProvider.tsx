'use client'

import { createContext, useContext } from 'react'

export interface Brand {
  name: string
  logo: string
  accent: string
}

const BrandContext = createContext<Brand>({ name: '', logo: '', accent: '' })

export function useBrand(): Brand {
  return useContext(BrandContext)
}

export default function BrandProvider({ value, children }: { value: Brand; children: React.ReactNode }) {
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}
