'use client'

import { useState } from 'react'
import Resta3Nav from '@/app/components/Resta3Nav'

const S = { bg: '#0a0d14', card: '#1a1d27', accent: '#f59e0b', text: '#f1f5f9', sub: '#64748b', border: 'rgba(245,158,11,0.1)' }

interface PO { id: number; supplier: string; date: string; items: number; total: number; status: 'pendiente' | 'recibida' | 'cancelada' }

const ORDERS: PO[] = [
  { id: 1, supplier: 'Carnes El Rancho', date: '2026-06-01', items: 5, total: 2400, status: 'recibida' },
  { id: 2, supplier: 'Distribuidora Fruver', date: '2026-06-02', items: 8, total: 980, status: 'recibida' },
  { id: 3, supplier: 'Bebidas Corona', date: '2026-06-03', items: 3, total: 1560, status: 'pendiente' },
  { id: 4, supplier: 'Lácteos del Norte', date: '2026-06-03', items: 4, total: 720, status: 'pendiente' },
  { id: 5, supplier: 'Abarrotes Mayoreo', date: '2026-05-28', items: 12, total: 3200, status: 'recibida' },
]

const STATUS_CFG = {
  pendiente: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Pendiente' },
  recibida:  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Recibida' },
  cancelada: { color: '#f87171', bg: 'rgba(239,68,68,0.12)', label: 'Cancelada' },
}

export default function ComprasPage() {
  const [orders, setOrders] = useState<PO[]>(ORDERS)

  function toggleStatus(id: number) {
    setOrders(o => o.map(po => po.id === id ? { ...po, status: po.status === 'pendiente' ? 'recibida' : 'pendiente' } : po))
  }

  const totalMonth = orders.filter(o => o.status === 'recibida').reduce((s, o) => s + o.total, 0)
  const pending = orders.filter(o => o.status === 'pendiente').length

  return (
    <div className="min-h-screen md:ml-[220px]" style={{ backgroundColor: S.bg }}>
      <Resta3Nav />
      <div className="max-w-[900px] mx-auto p-4 space-y-4">

        <div className="flex items-center justify-between pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>Compras y Proveedores</h1>
          <button className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }}>
            + Nueva orden
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <p className="text-xl font-black" style={{ color: S.accent }}>${totalMonth.toLocaleString()}</p>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Compras del mes</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: S.card, border: `1px solid rgba(245,158,11,0.2)` }}>
            <p className="text-xl font-black" style={{ color: '#f59e0b' }}>{pending}</p>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Órdenes pendientes</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <p className="text-xl font-black" style={{ color: '#3b82f6' }}>{new Set(orders.map(o => o.supplier)).size}</p>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Proveedores</p>
          </div>
        </div>

        {/* Lista de órdenes */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
            <span className="font-bold text-sm" style={{ color: S.text }}>Órdenes de compra</span>
          </div>
          <div className="divide-y" style={{ borderColor: S.border }}>
            {orders.map(po => {
              const cfg = STATUS_CFG[po.status]
              return (
                <div key={po.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                    style={{ backgroundColor: `${S.accent}18`, color: S.accent }}>
                    {po.supplier.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: S.text }}>{po.supplier}</p>
                    <p className="text-xs" style={{ color: S.sub }}>{po.date} · {po.items} productos</p>
                  </div>
                  <p className="font-black" style={{ color: S.accent }}>${po.total.toLocaleString()}</p>
                  <button onClick={() => toggleStatus(po.id)}
                    className="text-xs font-bold px-2.5 py-1 rounded-full transition-all"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
