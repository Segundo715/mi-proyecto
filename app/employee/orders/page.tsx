'use client'

// Gestión de pedidos para el empleado: polling cada 10 s, avanza estado igual que admin/orders.
import { useState, useEffect } from 'react'
import EmployeeNav from '@/app/components/EmployeeNav'
import { Icon } from '@/app/components/Icon'

interface OrderItem { name: string; quantity: number; price: number }
interface Order {
  id: string
  customerName: string
  tableNumber?: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered'
  createdAt: string
  notes?: string
}

const S = {
  bg:     'var(--ad-bg)',
  card:   'var(--ad-card)',
  accent: 'var(--ad-accent)',
  text:   'var(--ad-text)',
  sub:    'var(--ad-sub)',
  border: 'var(--ad-border)',
}

const STATUS_CONFIG: Record<Order['status'], { label: string; headerBg: string; cardBorderColor: string; step: number }> = {
  pending:   { label: 'Pendiente',  headerBg: '#ef4444', cardBorderColor: 'rgba(239,68,68,0.5)',   step: 0 },
  preparing: { label: 'Preparando', headerBg: '#f59e0b', cardBorderColor: 'rgba(245,158,11,0.5)', step: 1 },
  ready:     { label: 'Listo',      headerBg: '#22c55e', cardBorderColor: 'rgba(34,197,94,0.5)',  step: 2 },
  delivered: { label: 'Entregado',  headerBg: '#6b7280', cardBorderColor: S.border,               step: 3 },
}

const NEXT_ACTION: Partial<Record<Order['status'], { label: string; btnBg: string; btnColor: string }>> = {
  pending:   { label: 'Iniciar preparación', btnBg: '#f59e0b', btnColor: '#000' },
  preparing: { label: 'Marcar como listo',   btnBg: '#22c55e', btnColor: '#000' },
  ready:     { label: 'Confirmar entrega',   btnBg: '#6b7280', btnColor: '#fff' },
}

const NEXT_STATUS: Partial<Record<Order['status'], Order['status']>> = {
  pending: 'preparing', preparing: 'ready', ready: 'delivered',
}

const STEPS = ['Recibido', 'Preparando', 'Listo', 'Entregado']

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 90) return 'hace un momento'
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  return `hace ${Math.floor(s / 3600)} h`
}

function isNew(iso: string) {
  return Date.now() - new Date(iso).getTime() < 2 * 60 * 1000
}

interface TicketInfo { name: string; address: string; phone: string }

function printTicket(order: Order, info: TicketInfo) {
  const date = new Date(order.createdAt).toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const name = info.name || 'Restaurante'

  // IVA incluido en precios (estándar México)
  const subtotalBase = order.total / 1.16
  const iva = order.total - subtotalBase

  const rows = order.items.map(i => {
    const sub = i.price * i.quantity
    return `<div class="item">
      <div class="item-name">${i.name}</div>
      <div class="row"><span>$${i.price.toFixed(2)} × ${i.quantity}</span><span>$${sub.toFixed(2)}</span></div>
    </div>`
  }).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ticket</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Courier New',monospace;font-size:13px;width:80mm;margin:0 auto;padding:6mm}
.c{text-align:center}.b{font-weight:bold}.lg{font-size:17px}.sm{font-size:11px}.xs{font-size:10px}
.hr{border-top:1px dashed #000;margin:6px 0}
.row{display:flex;justify-content:space-between;margin:2px 0}
.item{margin:5px 0}.item-name{font-weight:bold;margin-bottom:1px}
.total-row{display:flex;justify-content:space-between;font-weight:bold;font-size:15px;margin:4px 0}
.pago{border-top:1px solid #000;border-bottom:1px solid #000;padding:5px 0;margin:6px 0}
</style></head><body>

<div class="c b lg">${name.toUpperCase()}</div>
${info.address ? `<div class="c sm" style="margin-top:2px">${info.address}</div>` : ''}
${info.phone ? `<div class="c sm">Tel: ${info.phone}</div>` : ''}
<div class="c xs" style="color:#444;margin-top:3px">${date}</div>
<div class="c xs" style="color:#666">Folio: #${order.id.slice(-8).toUpperCase()}</div>

<div class="hr"></div>
<div><b>Cliente:</b> ${order.customerName}</div>
${order.tableNumber ? `<div><b>Mesa:</b> ${order.tableNumber}</div>` : ''}
${order.notes ? `<div class="sm" style="margin-top:3px;color:#333">${order.notes.replace(/\n/g, '<br>')}</div>` : ''}

<div class="hr"></div>
<div class="row xs b"><span>DESCRIPCIÓN</span><span>IMPORTE</span></div>
<div style="margin:4px 0">
${rows}
</div>

<div class="hr"></div>
<div class="row sm"><span>Subtotal (sin IVA)</span><span>$${subtotalBase.toFixed(2)}</span></div>
<div class="row sm"><span>IVA 16%</span><span>$${iva.toFixed(2)}</span></div>
<div class="hr"></div>
<div class="total-row"><span>TOTAL</span><span>$${order.total.toFixed(2)}</span></div>

<div class="pago">
  <div class="sm b">Método de pago:</div>
  <div class="sm" style="margin-top:3px">
    ☐ Efectivo &nbsp;&nbsp; ☐ Tarjeta &nbsp;&nbsp; ☐ Transferencia
  </div>
</div>

<div class="c sm" style="margin-top:6px">¡Gracias por su preferencia!</div>
</body></html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank', 'width=380,height=600,noopener')
  if (!win) { URL.revokeObjectURL(url); return }
  win.addEventListener('load', () => { win.print(); URL.revokeObjectURL(url) })
}

export default function EmployeeOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState<string | null>(null)
  const [ticketInfo, setTicketInfo] = useState<TicketInfo>({ name: '', address: '', phone: '' })

  useEffect(() => {
    load()
    const interval = setInterval(load, 10000)
    Promise.all([
      fetch('/api/settings?key=restaurant_name').then(r => r.json()),
      fetch('/api/settings?key=restaurant_address').then(r => r.json()),
      fetch('/api/settings?key=restaurant_phone').then(r => r.json()),
    ]).then(([n, a, p]) => {
      setTicketInfo({ name: n?.value ?? '', address: a?.value ?? '', phone: p?.value ?? '' })
    }).catch(() => {})
    return () => clearInterval(interval)
  }, [])

  async function load() {
    const res = await fetch('/api/orders')
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }

  async function advance(id: string, next: Order['status']) {
    setAdvancing(id)
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    await load()
    setAdvancing(null)
  }

  const active = orders.filter(o => o.status !== 'delivered')
  const delivered = orders.filter(o => o.status === 'delivered')

  return (
    <div className="min-h-screen md:ml-[240px] md:pt-16" style={{ backgroundColor: S.bg }}>
      <EmployeeNav />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-xl font-black" style={{ color: S.text }}>
            Pedidos activos
            {active.length > 0 && (
              <span className="ml-2 text-sm font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#ef4444', color: '#fff' }}>{active.length}</span>
            )}
          </h1>
          <button type="button" onClick={load}
            className="text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ backgroundColor: 'var(--ad-overlay)', color: S.accent, border: `1px solid ${S.border}` }}>
            ↻ Actualizar
          </button>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: S.card }}>
                <div className="h-12" style={{ backgroundColor: 'var(--ad-overlay)' }} />
                <div className="p-4 space-y-3">
                  <div className="h-4 rounded-full w-2/3" style={{ backgroundColor: 'var(--ad-overlay)' }} />
                  <div className="h-10 rounded-xl mt-4" style={{ backgroundColor: 'var(--ad-overlay)' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && active.length === 0 && (
          <div className="flex flex-col items-center py-20" style={{ color: S.sub }}>
            <span className="mb-4"><Icon name="utensils" size={52} /></span>
            <p className="font-semibold text-lg" style={{ color: S.text }}>No hay pedidos activos</p>
            <p className="text-sm mt-1">Los nuevos pedidos aparecerán aquí</p>
          </div>
        )}

        {active.map(order => {
          const cfg = STATUS_CONFIG[order.status]
          const nextStatus = NEXT_STATUS[order.status]
          const nextAction = NEXT_ACTION[order.status]
          const isAdvancing = advancing === order.id
          const nuevo = isNew(order.createdAt)

          return (
            <div key={order.id} className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: S.card,
                border: `1px solid ${cfg.cardBorderColor}`,
                boxShadow: order.status === 'pending' ? '0 0 0 2px rgba(239,68,68,0.35)' : 'none',
              }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: cfg.headerBg }}>
                <div className="flex items-center gap-2">
                  {order.status === 'pending' && <span className="text-white animate-bounce"><Icon name="bell" size={17} /></span>}
                  {order.status === 'preparing' && <span className="text-white"><Icon name="chef" size={17} /></span>}
                  {order.status === 'ready' && <span className="text-white"><Icon name="checkCircle" size={17} /></span>}
                  <span className="text-white font-black text-sm uppercase tracking-wide">{cfg.label}</span>
                  {nuevo && <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">NUEVO</span>}
                </div>
                <span className="text-white/80 text-xs font-medium">{timeAgo(order.createdAt)}</span>
              </div>

              <div className="px-4 pt-3 flex items-center gap-1">
                {STEPS.map((_, i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className="h-1.5 rounded-full flex-1 transition-all"
                      style={{ backgroundColor: i <= cfg.step ? cfg.headerBg : 'rgba(255,255,255,0.1)' }} />
                    {i < STEPS.length - 1 && <div className="w-1" />}
                  </div>
                ))}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-black text-lg leading-tight" style={{ color: S.text }}>{order.customerName}</p>
                    {order.tableNumber && <p className="text-sm font-medium" style={{ color: S.sub }}>Mesa {order.tableNumber}</p>}
                  </div>
                  <span className="font-black text-xl" style={{ color: S.text }}>${order.total.toFixed(2)}</span>
                </div>

                <div className="rounded-xl p-3 space-y-1.5"
                  style={{ backgroundColor: 'var(--ad-overlay)', border: `1px solid ${S.border}` }}>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span style={{ color: S.text }}>
                        <span className="font-black" style={{ color: S.accent }}>{item.quantity}×</span> {item.name}
                      </span>
                      <span style={{ color: S.sub }}>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="flex items-start gap-2 rounded-xl px-3 py-2"
                    style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <span className="text-yellow-400 mt-0.5"><Icon name="note" size={14} /></span>
                    <p className="text-sm font-medium" style={{ color: '#fde68a' }}>{order.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {nextStatus && nextAction && (
                    <button type="button" onClick={() => advance(order.id, nextStatus)} disabled={isAdvancing}
                      className="flex-1 py-3.5 rounded-xl font-black text-sm transition-all disabled:opacity-60"
                      style={{ backgroundColor: nextAction.btnBg, color: nextAction.btnColor }}>
                      {isAdvancing ? 'Actualizando...' : `${nextAction.label} →`}
                    </button>
                  )}
                  <button type="button" onClick={() => printTicket(order, ticketInfo)}
                    className="px-4 py-3.5 rounded-xl font-black text-sm transition-all"
                    style={{ backgroundColor: 'var(--ad-overlay)', color: S.text, border: `1px solid ${S.border}` }}
                    title="Imprimir ticket">
                    🖨️
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {delivered.length > 0 && (
          <details className="group">
            <summary className="text-sm cursor-pointer py-2 px-1 flex items-center gap-2 select-none" style={{ color: S.sub }}>
              <span className="group-open:rotate-90 transition-transform inline-flex"><Icon name="play" size={11} /></span>
              Entregados ({delivered.length})
            </summary>
            <div className="space-y-2 mt-2">
              {delivered.slice(0, 10).map(order => (
                <div key={order.id} className="rounded-xl p-3 flex items-center gap-3 opacity-50"
                  style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                  <span style={{ color: S.sub }}><Icon name="box" size={22} /></span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: S.text }}>{order.customerName}</p>
                    <p className="text-xs truncate" style={{ color: S.sub }}>
                      {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: S.text }}>${order.total.toFixed(2)}</p>
                    <p className="text-xs" style={{ color: S.sub }}>{timeAgo(order.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
