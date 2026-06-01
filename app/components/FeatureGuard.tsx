'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { FeatureKey } from '@/lib/features'

const ROUTE_FEATURE: Record<string, string> = {
  '/admin/analytics':        'analytics',
  '/admin/estadisticas':     'analytics',
  '/admin/marketing':        'marketing',
  '/admin/crm':              'crm',
  '/admin/reservaciones':    'reservaciones',
  '/admin/ventas':           'ventas',
  '/admin/menu':             'menu',
  '/admin/operaciones':      'operaciones',
  '/admin/tv':               'tv',
  '/admin/automatizaciones': 'automatizaciones',
  '/admin/contenido':        'contenido',
  '/admin/produccion':       'produccion',
  '/admin/reportes':         'reportes',
  '/admin/configuracion':    'configuracion',
}

export default function FeatureGuard() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const feature = ROUTE_FEATURE[pathname]
    if (!feature) return

    fetch('/api/features')
      .then(r => r.json())
      .then((flags: Record<FeatureKey, boolean>) => {
        if (flags[feature as FeatureKey] === false) {
          router.replace('/admin')
        }
      })
      .catch(() => {})
  }, [pathname, router])

  return null
}
