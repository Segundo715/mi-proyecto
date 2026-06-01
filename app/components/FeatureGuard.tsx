'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useBrand } from './BrandProvider'

const ROUTE_FEATURE: Record<string, string> = {
  '/admin/analytics':       'analytics',
  '/admin/estadisticas':    'analytics',
  '/admin/marketing':       'marketing',
  '/admin/crm':             'crm',
  '/admin/reservaciones':   'reservaciones',
  '/admin/ventas':          'ventas',
  '/admin/menu':            'menu',
  '/admin/operaciones':     'operaciones',
  '/admin/tv':              'tv',
  '/admin/automatizaciones':'automatizaciones',
  '/admin/contenido':       'contenido',
  '/admin/produccion':      'produccion',
  '/admin/reportes':        'reportes',
  '/admin/configuracion':   'configuracion',
}

export default function FeatureGuard() {
  const pathname = usePathname()
  const router = useRouter()
  const { features } = useBrand()

  useEffect(() => {
    const feature = ROUTE_FEATURE[pathname]
    if (feature && features[feature] === false) {
      router.replace('/admin')
    }
  }, [pathname, features, router])

  return null
}
