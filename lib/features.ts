import { supabase } from './supabase'

export const FEATURES = {
  orders:          { label: 'Pedidos',           emoji: '📋' },
  menu:            { label: 'Menú',              emoji: '🍽' },
  reviews:         { label: 'Reseñas',           emoji: '⭐' },
  tv:              { label: 'Pantalla TV',       emoji: '📺' },
  customers:       { label: 'Clientes',          emoji: '👥' },
  analytics:       { label: 'Analytics',         emoji: '📊' },
  loyaltyCard:     { label: 'Tarjeta Lealtad',   emoji: '☕' },
  favorites:       { label: 'Favoritos',         emoji: '❤️'  },
  ventas:          { label: 'Ventas',            emoji: '💰' },
  marketing:       { label: 'Marketing',         emoji: '📣' },
  crm:             { label: 'CRM',               emoji: '🤝' },
  reservaciones:   { label: 'Reservaciones',     emoji: '📅' },
  operaciones:     { label: 'Operaciones',       emoji: '🏭' },
  automatizaciones:{ label: 'Automatizaciones',  emoji: '🤖' },
  contenido:       { label: 'Contenido',         emoji: '🖼'  },
  produccion:      { label: 'Producción',        emoji: '📦' },
  reportes:        { label: 'Reportes',          emoji: '📑' },
  configuracion:   { label: 'Configuración',     emoji: '⚙️'  },
} as const

export type FeatureKey = keyof typeof FEATURES

export type FeatureFlags = Record<FeatureKey, boolean>

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const rid = process.env.NEXT_PUBLIC_RESTAURANT_ID
  const keys = rid ? [`feature_flags_${rid}`, 'feature_flags'] : ['feature_flags']

  let overrides: Partial<FeatureFlags> = {}
  for (const key of keys) {
    const { data } = await supabase.from('settings').select('value').eq('key', key).maybeSingle()
    if (data?.value) { overrides = JSON.parse(data.value); break }
  }

  return Object.fromEntries(
    Object.keys(FEATURES).map(k => [k, overrides[k as FeatureKey] ?? true])
  ) as FeatureFlags
}
