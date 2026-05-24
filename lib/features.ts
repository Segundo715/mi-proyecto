export const FEATURES = {
  orders:          { enabled: true,  label: 'Pedidos',           emoji: '📋' },
  menu:            { enabled: true,  label: 'Menú',              emoji: '🍽' },
  reviews:         { enabled: true,  label: 'Reseñas',           emoji: '⭐' },
  tv:              { enabled: true,  label: 'Pantalla TV',       emoji: '📺' },
  customers:       { enabled: true,  label: 'Clientes',          emoji: '👥' },
  analytics:       { enabled: true,  label: 'Analytics',         emoji: '📊' },
  loyaltyCard:     { enabled: true,  label: 'Tarjeta Lealtad',   emoji: '☕' },
  favorites:       { enabled: true,  label: 'Favoritos',         emoji: '❤️'  },
  ventas:          { enabled: true,  label: 'Ventas',            emoji: '💰' },
  marketing:       { enabled: true,  label: 'Marketing',         emoji: '📣' },
  crm:             { enabled: true,  label: 'CRM',               emoji: '🤝' },
  reservaciones:   { enabled: true,  label: 'Reservaciones',     emoji: '📅' },
  operaciones:     { enabled: true,  label: 'Operaciones',       emoji: '🏭' },
  automatizaciones:{ enabled: true,  label: 'Automatizaciones',  emoji: '🤖' },
  contenido:       { enabled: true,  label: 'Contenido',         emoji: '🖼'  },
  produccion:      { enabled: true,  label: 'Producción',        emoji: '📦' },
  reportes:        { enabled: true,  label: 'Reportes',          emoji: '📑' },
  configuracion:   { enabled: true,  label: 'Configuración',     emoji: '⚙️'  },
} as const

export type FeatureKey = keyof typeof FEATURES
