'use client'

import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: '#080b16', card: '#0e1225', accent: '#00e676',
  text: '#eef2f7', sub: '#6b7a94', border: 'rgba(255,255,255,0.07)',
}

const CONFIG_ITEMS = [
  { icon: '🏪', label: 'Sucursales',        desc: 'Ubicaciones y horarios'      },
  { icon: '👤', label: 'Usuarios y roles',  desc: 'Permisos y acceso'            },
  { icon: '🔗', label: 'Integraciones',     desc: 'Stripe, WhatsApp, n8n'       },
  { icon: '🎨', label: 'Branding',          desc: 'Logo, colores, tokens'        },
  { icon: '🚩', label: 'Feature Flags',     desc: 'Activar/desactivar por sucursal' },
  { icon: '🔔', label: 'Webhooks',          desc: 'Endpoints y secrets'          },
  { icon: '💳', label: 'Plan y facturación',desc: 'Uso y facturas'               },
  { icon: '📋', label: 'Audit Log',         desc: 'Historial de cambios'         },
]

export default function AdminConfiguracionPage() {
  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[1200px] mx-auto p-4 space-y-4">

        {/* Header */}
        <div className="pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>⚙️ Configuración</h1>
          <p className="text-xs mt-0.5" style={{ color: S.sub }}>Sistema, integraciones y personalización</p>
        </div>

        {/* Config grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CONFIG_ITEMS.map(item => (
            <button key={item.label}
              className="flex items-center gap-3 p-5 rounded-2xl text-left transition-all hover:scale-[1.02]"
              style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <span className="text-2xl shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p className="font-bold text-sm" style={{ color: S.text }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: S.sub }}>{item.desc}</p>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
