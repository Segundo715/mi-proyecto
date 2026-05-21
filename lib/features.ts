/**
 * Feature flags — toggle on/off each module.
 * Set to false to show it as "Premium" (locked) in the admin panel.
 * Useful when selling this system to other coffee shops.
 */
export const FEATURES = {
  orders:      { enabled: true,  label: 'Pedidos',         emoji: '📋' },
  menu:        { enabled: true,  label: 'Menú',            emoji: '🍽' },
  reviews:     { enabled: true,  label: 'Reseñas',         emoji: '⭐' },
  tv:          { enabled: true,  label: 'Pantalla TV',     emoji: '📺' },
  customers:   { enabled: true,  label: 'Clientes',        emoji: '👥' },
  analytics:   { enabled: true,  label: 'Analytics',       emoji: '📊' },
  loyaltyCard: { enabled: true,  label: 'Tarjeta Lealtad', emoji: '☕' },
  favorites:   { enabled: true,  label: 'Favoritos',       emoji: '❤️'  },
} as const

export type FeatureKey = keyof typeof FEATURES
