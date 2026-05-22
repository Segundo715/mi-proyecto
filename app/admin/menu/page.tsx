'use client'

import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: '#080b16', card: '#0e1225', accent: '#00e676',
  text: '#eef2f7', sub: '#6b7a94', border: 'rgba(255,255,255,0.07)',
}

const PRODUCTS = [
  { name: '🍣 Sushi Premium',    cat: 'Sushi',   price: '$380', cost: '$120', margin: '68.4%', sold: 245, active: true  },
  { name: '🥩 Rib Eye 400g',    cat: 'Cortes',  price: '$650', cost: '$280', margin: '56.9%', sold: 189, active: true  },
  { name: '🌮 Tacos de Rib Eye', cat: 'Tacos',  price: '$320', cost: '$95',  margin: '70.3%', sold: 156, active: true  },
  { name: '🍹 Margarita Clásica',cat: 'Bebidas', price: '$180', cost: '$42',  margin: '76.7%', sold: 132, active: true  },
]

export default function AdminMenuPage() {
  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[1200px] mx-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-black" style={{ color: S.text }}>🍽️ Menú Inteligente</h1>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Productos, categorías y disponibilidad</p>
          </div>
          <button className="text-sm px-4 py-2 rounded-xl font-bold" style={{ backgroundColor: S.accent, color: '#000' }}>+ Nuevo producto</button>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                  {['Producto','Categoría','Precio','Costo','Margen','Vendidos hoy','Estado'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: S.sub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map(p => (
                  <tr key={p.name} style={{ borderBottom: `1px solid ${S.border}` }} className="hover:bg-white/[.02]">
                    <td className="px-5 py-3 font-bold" style={{ color: S.text }}>{p.name}</td>
                    <td className="px-5 py-3" style={{ color: S.sub }}>{p.cat}</td>
                    <td className="px-5 py-3" style={{ color: S.text }}>{p.price}</td>
                    <td className="px-5 py-3" style={{ color: S.sub }}>{p.cost}</td>
                    <td className="px-5 py-3 font-bold" style={{ color: S.accent }}>{p.margin}</td>
                    <td className="px-5 py-3" style={{ color: S.text }}>{p.sold}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: 'rgba(0,230,118,.12)', color: '#4ade80' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#4ade80' }} />Activo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
