'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { FeatureKey } from '@/lib/features'

// Feature flags (admin + global)
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

// Employee module permissions
const EMPLOYEE_ROUTE_MODULE: Record<string, string> = {
  '/employee/orders':    'emp_pedidos',
  '/employee/menu':      'emp_menu_ver',
  '/employee/recipes':   'emp_recetario',
  '/employee/customers': 'emp_clientes_ver',
  '/employee/tv':        'emp_pantalla_tv',
}

// User module permissions
const USER_ROUTE_MODULE: Record<string, string> = {
  '/menu':      'usr_menu',
  '/card':      'usr_tarjeta',
  '/review':    'usr_resenas',
  '/resena':    'usr_resenas',
  '/registro':  'usr_registro_qr',
  '/loyalty':   'usr_tarjeta',
}

export default function FeatureGuard() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Check admin feature flags
    const feature = ROUTE_FEATURE[pathname]
    if (feature) {
      fetch('/api/features')
        .then(r => r.json())
        .then((flags: Record<FeatureKey, boolean>) => {
          if (flags[feature as FeatureKey] === false) router.replace('/admin')
        })
        .catch(() => {})
      return
    }

    // Check employee permissions
    const empModule = EMPLOYEE_ROUTE_MODULE[pathname]
    if (empModule) {
      fetch('/api/permissions')
        .then(r => r.json())
        .then((perms: { employee: Record<string, boolean>; user: Record<string, boolean> }) => {
          if (perms.employee[empModule] === false) router.replace('/employee')
        })
        .catch(() => {})
      return
    }

    // Check user permissions
    const userModule = USER_ROUTE_MODULE[pathname]
    if (userModule) {
      fetch('/api/permissions')
        .then(r => r.json())
        .then((perms: { employee: Record<string, boolean>; user: Record<string, boolean> }) => {
          if (perms.user[userModule] === false) router.replace('/')
        })
        .catch(() => {})
    }
  }, [pathname, router])

  return null
}
