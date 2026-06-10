'use client'

// KDS de cocina con pestaña de delivery (Gogo / Uber Eats / Rappi).
// Los pedidos de delivery usan notes con prefijo [GOGO], [UBEREATS] o [RAPPI].
// Estado extra: picked_up (repartidor recogió) entre ready → delivered.
import { useState, useEffect, useRef } from 'react'
import Resta3Nav from '@/app/components/Resta3Nav'

const S = { bg: 'var(--ad-bg)', card: 'var(--ad-card)', accent: 'var(--ad-accent)', text: 'var(--ad-text)', sub: 'var(--ad-sub)', border: 'var(--ad-border)' }

interface OrderItem { name: string; quantity: number; price: number }
interface Order { id: string; customerName: string; tableNumber?: string; status: string; items: OrderItem[]; notes?: string; createdAt: string }

const PLATFORMS = {
  GOGO:     { key: 'GOGO',     label: 'Gogo',      color: '#ff6b35', bg: 'rgba(255,107,53,0.12)',  border: 'rgba(255,107,53,0.4)',  emoji: '🧡' },
  UBEREATS: { key: 'UBEREATS', label: 'Uber Eats', color: '#06c167', bg: 'rgba(6,193,103,0.12)',   border: 'rgba(6,193,103,0.4)',   emoji: '💚' },
  RAPPI:    { key: 'RAPPI',    label: 'Rappi',     color: '#ff441b', bg: 'rgba(255,68,27,0.12)',   border: 'rgba(255,68,27,0.4)',   emoji: '❤️' },
} as const
type PlatformKey = keyof typeof PLATFORMS

const KDS_CFG: Record<string, { label: string; color: string; next: string; nextLabel: string; urgentAfter: number }> = {
  pending:   { label: 'Nuevo',      color: '#f59e0b', next: 'preparing', nextLabel: '▶ Iniciar',      urgentAfter: 5 },
  preparing: { label: 'Preparando', color: '#3b82f6', next: 'ready',     nextLabel: '✓ Listo',         urgentAfter: 15 },
  ready:     { label: 'Listo',      color: '#22c55e', next: 'delivered', nextLabel: '🚀 Entregar',     urgentAfter: 10 },
}

const DELIVERY_CFG: Record<string, { label: string; color: string; next: string; nextLabel: string; urgentAfter: number }> = {
  pending:   { label: 'Nuevo',           color: '#f59e0b', next: 'preparing', nextLabel: '▶ Preparar',    urgentAfter: 5 },
  preparing: { label: 'Preparando',      color: '#3b82f6', next: 'ready',     nextLabel: '✓ Listo',       urgentAfter: 20 },
  ready:     { label: 'Esperando rider', color: '#a855f7', next: 'picked_up', nextLabel: '🛵 Recogido',   urgentAfter: 15 },
  picked_up: { label: 'En camino',       color: '#06b6d4', next: 'delivered', nextLabel: '✅ Entregado',  urgentAfter: 40 },
}

function getPlatform(notes?: string) {
  if (!notes) return null
  const m = notes.match(/^\[(\w+)\]/)
  if (!m) return null
  return PLATFORMS[m[1] as PlatformKey] ?? null
}
function isDelivery(o: Order) { return getPlatform(o.notes) !== null }
function cleanNote(notes?: string) { return (notes ?? '').replace(/^\[\w+\]\s*/, '').trim() }

function elapsed(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return { label: 'ahora', mins: 0 }
  return { label: `${mins} min`, mins }
}

// ── Order card ────────────────────────────────────────────────────────────────
function OrderCard({ order, cfg, advancing, onAdvance }: {
  order: Order
  cfg: typeof KDS_CFG[string]
  advancing: string | null
  onAdvance: (id: string, next: string) => void
}) {
  const { label: elLabel, mins } = elapsed(order.createdAt)
  const urgent = mins >= cfg.urgentAfter
  const platform = getPlatform(order.notes)
  const note = cleanNote(order.notes)

  return (
    <div className="rounded-2xl p-4 space-y-3 transition-all"
      style={{ backgroundColor: S.card, border: `2px solid ${urgent ? cfg.color + '66' : platform ? platform.border : cfg.color + '22'}` }}>

      {/* Platform badge */}
      {platform && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit"
          style={{ backgroundColor: platform.bg, border: `1px solid ${platform.border}` }}>
          <span className="text-xs">{platform.emoji}</span>
          <span className="text-xs font-black" style={{ color: platform.color }}>{platform.label}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-black text-sm" style={{ color: S.text }}>{order.customerName}</p>
          {order.tableNumber && <p className="text-xs" style={{ color: S.sub }}>{order.tableNumber}</p>}
        </div>
        <span className="text-xs font-black px-2 py-0.5 rounded-full shrink-0"
          style={{ backgroundColor: urgent ? `${cfg.color}30` : `${cfg.color}15`, color: cfg.color }}>
          {urgent ? '⚠ ' : ''}{elLabel}
        </span>
      </div>

      {/* Items */}
      {order.items.length > 0 && (
        <ul className="space-y-1">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm" style={{ color: S.text }}>
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>{item.quantity}</span>
              {item.name}
            </li>
          ))}
        </ul>
      )}

      {/* Nota */}
      {note && (
        <p className="text-xs px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#0f1117', color: '#fbbf24' }}>
          📝 {note}
        </p>
      )}

      {/* Acción */}
      <button onClick={() => onAdvance(order.id, cfg.next)} disabled={advancing === order.id}
        className="w-full py-2.5 rounded-xl text-sm font-black transition-all disabled:opacity-60"
        style={{ background: `linear-gradient(135deg,${cfg.color}22,${cfg.color}11)`, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
        {advancing === order.id ? 'Guardando...' : cfg.nextLabel}
      </button>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CocinaPage() {
  const [tab, setTab] = useState<'cocina' | 'domicilio'>('cocina')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState<string | null>(null)
  const [lastCount, setLastCount] = useState(0)
  const [newAlert, setNewAlert] = useState(false)
  const audioRef = useRef<AudioContext | null>(null)

  // Modal nuevo pedido de delivery
  const [showModal, setShowModal] = useState(false)
  const [modalPlatform, setModalPlatform] = useState<PlatformKey>('GOGO')
  const [modalName, setModalName] = useState('')
  const [modalNote, setModalNote] = useState('')
  const [modalSaving, setModalSaving] = useState(false)

  async function load(silent = false) {
    const r = await fetch('/api/orders')
    if (!r.ok) return
    const data: Order[] = await r.json()
    const active = data.filter(o => o.status !== 'delivered')
    if (!silent && active.length > lastCount && lastCount > 0) {
      setNewAlert(true)
      playBeep()
      setTimeout(() => setNewAlert(false), 4000)
    }
    setLastCount(active.length)
    setOrders(active)
    setLoading(false)
  }

  function playBeep() {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext()
      const ctx = audioRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = 880; gain.gain.value = 0.3
      osc.start(); osc.stop(ctx.currentTime + 0.2)
    } catch {}
  }

  useEffect(() => {
    load(true)
const t = setInterval(() => load(), 10000)
    return () => clearInterval(t)
  }, [])


  async function advance(id: string, next: string) {
    setAdvancing(id)
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    await load(true)
    setAdvancing(null)
  }

  async function createDeliveryOrder() {
    if (!modalName.trim()) return
    setModalSaving(true)
    const notes = modalNote.trim()
      ? `[${modalPlatform}] ${modalNote.trim()}`
      : `[${modalPlatform}]`
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: modalName.trim(),
        items: [],
        total: 0,
        notes,
      }),
    })
    await load(true)
    setModalSaving(false)
    setShowModal(false)
    setModalName('')
    setModalNote('')
    setTab('domicilio')
  }

  const localOrders   = orders.filter(o => !isDelivery(o))
  const deliveryOrders = orders.filter(o => isDelivery(o))
  const kdsGroups = ['pending', 'preparing', 'ready']
  const deliveryGroups = ['pending', 'preparing', 'ready', 'picked_up']

  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <Resta3Nav />

      {newAlert && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl font-black text-sm animate-bounce"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }}>
          🔔 ¡Nuevo pedido!
        </div>
      )}

      <div className="max-w-[1400px] mx-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-black" style={{ color: S.text }}>Cocina</h1>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>
              {localOrders.length} en mesa · {deliveryOrders.length} a domicilio · Actualiza cada 10s
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowModal(true)}
              className="text-xs px-3 py-2 rounded-xl font-bold transition-all"
              style={{ backgroundColor: 'rgba(6,193,103,0.15)', color: '#06c167', border: '1px solid rgba(6,193,103,0.3)' }}>
              + Pedido domicilio
            </button>
            <button onClick={() => load(true)}
              className="text-xs px-3 py-2 rounded-lg font-bold"
              style={{ backgroundColor: S.card, color: S.accent, border: `1px solid ${S.border}` }}>
              ↻
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
          {([['cocina', '🍽️ Cocina', localOrders.length], ['domicilio', '🛵 Domicilio', deliveryOrders.length]] as const).map(([t, label, count]) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
              style={tab === t ? { backgroundColor: S.accent, color: '#000' } : { color: S.sub, backgroundColor: 'transparent' }}>
              {label}
              {count > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={tab === t ? { backgroundColor: 'rgba(0,0,0,0.25)', color: '#000' } : { backgroundColor: `${S.accent}22`, color: S.accent }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm" style={{ color: S.sub }}>Cargando pedidos...</div>
        ) : (
          <>
            {/* ── Tab: Cocina KDS ── */}
            {tab === 'cocina' && (
              localOrders.length === 0 ? (
                <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                  <p className="text-5xl mb-3">✅</p>
                  <p className="text-lg font-black" style={{ color: S.text }}>Cocina al día</p>
                  <p className="text-sm mt-1" style={{ color: S.sub }}>Sin pedidos en mesa pendientes</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {kdsGroups.map(status => {
                    const cfg = KDS_CFG[status]
                    const group = localOrders.filter(o => o.status === status)
                    return (
                      <div key={status}>
                        <div className="flex items-center gap-2 mb-3 px-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                          <span className="text-sm font-black" style={{ color: cfg.color }}>{cfg.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>{group.length}</span>
                        </div>
                        <div className="space-y-3">
                          {group.length === 0 ? (
                            <div className="rounded-2xl p-6 text-center text-sm"
                              style={{ backgroundColor: S.card, border: `1px solid ${S.border}`, color: S.sub }}>
                              Sin pedidos
                            </div>
                          ) : group.map(order => (
                            <OrderCard key={order.id} order={order} cfg={cfg} advancing={advancing} onAdvance={advance} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* ── Tab: Domicilio ── */}
            {tab === 'domicilio' && (
              deliveryOrders.length === 0 ? (
                <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                  <p className="text-5xl mb-3">🛵</p>
                  <p className="text-lg font-black" style={{ color: S.text }}>Sin pedidos de delivery</p>
                  <p className="text-sm mt-1" style={{ color: S.sub }}>Usa el botón "+ Pedido domicilio" para registrar uno</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {deliveryGroups.map(status => {
                    const cfg = DELIVERY_CFG[status]
                    if (!cfg) return null
                    const group = deliveryOrders.filter(o => o.status === status)
                    return (
                      <div key={status}>
                        <div className="flex items-center gap-2 mb-3 px-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                          <span className="text-sm font-black" style={{ color: cfg.color }}>{cfg.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>{group.length}</span>
                        </div>
                        <div className="space-y-3">
                          {group.length === 0 ? (
                            <div className="rounded-2xl p-6 text-center text-sm"
                              style={{ backgroundColor: S.card, border: `1px solid ${S.border}`, color: S.sub }}>
                              Sin pedidos
                            </div>
                          ) : group.map(order => (
                            <OrderCard key={order.id} order={order} cfg={cfg} advancing={advancing} onAdvance={advance} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* ── Modal: Nuevo pedido de delivery ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setShowModal(false)}>
          <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 space-y-4"
            style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between">
              <h2 className="font-black text-base" style={{ color: S.text }}>Nuevo pedido a domicilio</h2>
              <button onClick={() => setShowModal(false)} style={{ color: S.sub }} className="text-xl">✕</button>
            </div>

            {/* Plataforma */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: S.sub }}>
                Plataforma
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.values(PLATFORMS)).map(p => (
                  <button key={p.key} onClick={() => setModalPlatform(p.key as PlatformKey)}
                    className="py-3 rounded-xl text-sm font-bold flex flex-col items-center gap-1 transition-all"
                    style={modalPlatform === p.key
                      ? { backgroundColor: p.bg, color: p.color, border: `2px solid ${p.color}` }
                      : { backgroundColor: S.bg, color: S.sub, border: `1px solid ${S.border}` }}>
                    <span className="text-xl">{p.emoji}</span>
                    <span className="text-xs">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre / ID del pedido */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: S.sub }}>
                Cliente / ID del pedido
              </label>
              <input
                value={modalName}
                onChange={e => setModalName(e.target.value)}
                placeholder="Ej: #4521 · Juan García"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }}
                autoFocus
              />
            </div>

            {/* Notas / descripción */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: S.sub }}>
                Descripción (opcional)
              </label>
              <textarea
                value={modalNote}
                onChange={e => setModalNote(e.target.value)}
                placeholder="Ej: 2 hamburguesas sin cebolla..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }}
              />
            </div>

            <button onClick={createDeliveryOrder} disabled={modalSaving || !modalName.trim()}
              className="w-full py-3.5 rounded-xl font-black text-sm disabled:opacity-50 transition-all"
              style={{ backgroundColor: PLATFORMS[modalPlatform].color, color: '#fff' }}>
              {modalSaving ? 'Registrando...' : `Registrar pedido ${PLATFORMS[modalPlatform].label}`}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
