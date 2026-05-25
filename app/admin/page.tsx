'use client'

import AdminNav from '@/app/components/AdminNav'

const S = {
  bg: '#080b16', card: '#0e1225', accent: '#00e676',
  text: '#eef2f7', sub: '#6b7a94', border: 'rgba(255,255,255,0.07)',
  elevated: '#181d3a',
}

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-0.5 h-7">
      {data.map((v, i) => (
        <div key={i} className="w-1 rounded-sm" style={{ height: `${Math.max(4, (v / max) * 28)}px`, backgroundColor: color, opacity: 0.7 }} />
      ))}
    </div>
  )
}

const WEEKS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
const EMIT   = [42000, 48000, 45000, 49200]
const CANJE  = [11000, 14000, 12500, 14900]
const MAX_E  = Math.max(...EMIT)

export default function AdminFidelizacionPage() {
  return (
    <div className="min-h-screen md:ml-[240px]" style={{ backgroundColor: S.bg }}>
      <AdminNav />
      <div className="max-w-[1200px] mx-auto p-4 space-y-4">

<<<<<<< Updated upstream
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-black" style={{ color: S.text }}>💎 Fidelización</h1>
            <p className="text-xs mt-0.5" style={{ color: S.sub }}>Programa de lealtad, puntos, tarjetas y rewards</p>
=======
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('scan')
  const [origin, setOrigin] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [scanMode, setScanMode] = useState<ScanMode>('idle')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [scanned, setScanned] = useState<Customer | null>(null)
  const [scanError, setScanError] = useState('')
  const [phoneSearch, setPhoneSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const scanKey = useRef(0)

  useEffect(() => {
    setOrigin(window.location.origin)
    loadCustomers()
    const poll = setInterval(loadCustomers, 8000)
    return () => clearInterval(poll)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCustomers() {
    setLoadingList(true)
    try {
      const res = await fetch('/api/customers')
      if (res.ok) setCustomers(await res.json())
    } finally {
      setLoadingList(false)
    }
  }

  async function loadCustomer(id: string) {
    setScanState('found')
    setScanError('')
    const res = await fetch(`/api/customers/${id}`)
    if (res.ok) {
      setScanned(await res.json())
    } else {
      setScanError('Cliente no encontrado.')
      setScanState('idle')
    }
  }

  async function searchByPhone() {
    const q = phoneSearch.replace(/\D/g, '')
    if (q.length < 6) { setScanError('Ingresa al menos 6 dígitos del teléfono.'); return }
    setSearching(true)
    setScanError('')
    const res = await fetch('/api/customers')
    if (res.ok) {
      const all: Customer[] = await res.json()
      const match = all.find(c => c.phone.replace(/\D/g, '').includes(q) && c.confirmed)
      if (match) {
        setScanned(match)
        setScanState('found')
      } else {
        setScanError('No se encontró ningún cliente confirmado con ese número.')
      }
    }
    setSearching(false)
  }

  function handleCameraError() {
    setScanError('La cámara no pudo abrirse. Usa la búsqueda por teléfono.')
    setScanMode('idle')
  }

  async function deleteCustomerFn(id: string) {
    if (!confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) return
    await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    loadCustomers()
    if (scanned?.id === id) resetScan()
  }

  async function activateCustomer(id: string) {
    await fetch(`/api/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'confirm' }),
    })
    loadCustomers()
  }

  async function redeemCoffee() {
    if (!scanned) return
    setScanState('stamping')
    const res = await fetch(`/api/customers/${scanned.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'redeem' }),
    })
    if (res.ok) {
      setScanned(await res.json())
      setScanState('done')
      loadCustomers()
    } else {
      setScanState('found')
    }
  }

  async function stampVisit() {
    if (!scanned) return
    setScanState('stamping')
    const res = await fetch(`/api/customers/${scanned.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stamp' }),
    })
    if (res.ok) {
      setScanned(await res.json())
      setScanState('done')
      loadCustomers()
    } else {
      setScanState('found')
      setScanError('Error al registrar la visita.')
    }
  }

  function resetScan() {
    scanKey.current += 1
    setScanMode('idle')
    setScanState('idle')
    setScanned(null)
    setScanError('')
    setPhoneSearch('')
  }

  function activationWALink(c: Customer) {
    const link = `${origin}/activate?id=${c.id}`
    const msg = encodeURIComponent(
      `¡Hola ${c.name}! 🎉 Tu tarjeta de fidelización ☕ está lista.\n\nToca este link para activarla:\n${link}\n\nCon cada 5 visitas ganas un café gratis. ¡Gracias!`
    )
    return `https://wa.me/${c.phone.replace(/\D/g, '')}?text=${msg}`
  }

  function activationSMSLink(c: Customer) {
    const link = `${origin}/activate?id=${c.id}`
    const msg = encodeURIComponent(`Hola ${c.name}, activa tu tarjeta: ${link}`)
    return `sms:${c.phone.replace(/\D/g, '')}?body=${msg}`
  }

  const pending = customers.filter(c => !c.confirmed)
  const confirmed = customers.filter(c => c.confirmed)
  const checkIns = customers.filter(c => {
    if (!c.requestedAt) return false
    return Date.now() - new Date(c.requestedAt).getTime() < 3 * 60 * 1000
  })
  const sortedConfirmed = [...confirmed].sort((a, b) => {
    const aT = a.stamps.at(-1)?.timestamp ?? a.registeredAt
    const bT = b.stamps.at(-1)?.timestamp ?? b.registeredAt
    return bT.localeCompare(aT)
  })

  // Bloque reutilizable: muestra info del cliente escaneado + botón de sello
  const ScannedCard = scanned ? (
    <div className="space-y-3">
      <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="font-bold text-zinc-100 text-lg">{scanned.name}</p>
            <p className="text-zinc-400 text-sm">{scanned.phone}</p>
          </div>
          <div className="text-right">
            <span className={`text-3xl font-bold ${scanned.visits >= 5 ? 'text-green-400' : 'text-amber-400'}`}>
              {scanned.visits}/5
            </span>
            <p className="text-xs text-zinc-500">visitas</p>
>>>>>>> Stashed changes
          </div>
          <button className="text-sm px-4 py-2 rounded-xl font-bold" style={{ backgroundColor: S.accent, color: '#000' }}>+ Nuevo reward</button>
        </div>
<<<<<<< Updated upstream

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Miembros activos',    value: '2,847', delta: '↑ 12.4% vs mes ant.', icon: '💳', iconBg: 'rgba(168,85,247,.12)', sc: '#c084fc', spark: [18,22,20,26,24,30,28,34,32,38] },
            { label: 'Puntos emitidos (mes)',value: '184K',  delta: '↑ 8.7% vs mes ant.',  icon: '⭐', iconBg: 'rgba(0,230,118,.10)',  sc: '#00e676', spark: [12,14,13,16,15,18,17,20,19,22] },
            { label: 'Canjes realizados',   value: '342',   delta: '↑ 15.2%',              icon: '🎁', iconBg: 'rgba(251,191,36,.12)', sc: '#fbbf24', spark: [5,8,7,10,9,14,12,16,14,18]  },
            { label: 'Tasa de retención',   value: '78%',   delta: '↑ 3.1pp',              icon: '🔄', iconBg: 'rgba(59,130,246,.12)', sc: '#60a5fa', spark: [60,62,64,66,68,70,72,74,76,78] },
            { label: 'LTV miembros vs no',  value: '3.4x',  delta: '↑ 0.3x',               icon: '📈', iconBg: 'rgba(6,182,212,.12)',  sc: '#22d3ee', spark: [2.4,2.6,2.7,2.9,3.0,3.1,3.2,3.3,3.3,3.4] },
          ].map(k => (
            <div key={k.label} className="rounded-2xl p-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium" style={{ color: S.sub }}>{k.label}</p>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: k.iconBg }}>{k.icon}</span>
              </div>
              <p className="text-[1.7rem] font-black leading-none mb-2" style={{ color: S.text }}>{k.value}</p>
              <div className="flex items-end justify-between">
                <span className="text-xs font-medium" style={{ color: '#4ade80' }}>{k.delta}</span>
                <Spark data={k.spark} color={k.sc} />
              </div>
=======
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-8 rounded-full flex items-center justify-center text-sm ${i < scanned.visits ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-700 text-zinc-600'}`}
            >
              ☕
>>>>>>> Stashed changes
            </div>
          ))}
        </div>

<<<<<<< Updated upstream
        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Distribución por Tier */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Distribución por Tier</span>
            </div>
            <div className="px-5 py-4">
              {/* SVG donut */}
              <div className="flex justify-center mb-4">
                <svg viewBox="0 0 120 120" width="180" height="180">
                  {(() => {
                    const data = [{ v: 124, c: '#c084fc' }, { v: 412, c: '#fbbf24' }, { v: 845, c: '#60a5fa' }, { v: 1466, c: '#64748b' }]
                    const total = data.reduce((s, d) => s + d.v, 0)
                    let offset = 0
                    const r = 45, cx = 60, cy = 60, gap = 2
                    return data.map((d, i) => {
                      const pct = d.v / total
                      const circ = 2 * Math.PI * r
                      const startAngle = offset
                      offset += pct * 360
                      return (
                        <circle key={i} cx={cx} cy={cy} r={r}
                          fill="none" stroke={d.c} strokeWidth="18"
                          strokeDasharray={`${(pct * 360 - gap) / 360 * circ} ${circ}`}
                          strokeDashoffset={-(startAngle / 360) * circ + circ / 4}
                          strokeLinecap="butt" />
                      )
                    })
                  })()}
                  <text x="60" y="56" textAnchor="middle" fill="#eef2f7" fontSize="14" fontWeight="900">2,847</text>
                  <text x="60" y="70" textAnchor="middle" fill="#6b7a94" fontSize="8">miembros</text>
                </svg>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Platinum', count: '124',   pct: '4.4%',  color: '#c084fc' },
                  { label: 'Gold',     count: '412',   pct: '14.5%', color: '#fbbf24' },
                  { label: 'Silver',   count: '845',   pct: '29.7%', color: '#60a5fa' },
                  { label: 'Bronze',   count: '1,466', pct: '51.4%', color: '#64748b' },
                ].map(t => (
                  <div key={t.label} className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: t.color }} />
                    <span className="flex-1 text-sm" style={{ color: S.text }}>{t.label}</span>
                    <span className="font-bold text-sm" style={{ color: S.text }}>{t.count}</span>
                    <span className="text-xs w-10 text-right" style={{ color: S.sub }}>{t.pct}</span>
                  </div>
                ))}
              </div>
=======
      {!scanned.confirmed ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 text-center text-sm">
          Este cliente aún no activó su tarjeta. Envíale el link desde la pestaña Clientes.
        </div>
      ) : scanState === 'done' ? (
        <div className="bg-green-500/15 text-green-300 rounded-xl p-4 text-center font-bold">
          ✅ Visita registrada — {scanned.visits}/5 sellos
        </div>
      ) : scanned.visits >= 5 ? (
        <button
          onClick={redeemCoffee}
          disabled={scanState === 'stamping'}
          className="w-full bg-yellow-400 active:bg-yellow-500 text-amber-900 font-bold py-4 rounded-xl text-base disabled:opacity-60"
        >
          {scanState === 'stamping' ? 'Canjeando...' : '🎉 Canjear café gratis y reiniciar'}
        </button>
      ) : (
        <button
          onClick={stampVisit}
          disabled={scanState === 'stamping'}
          className="w-full bg-amber-600 active:bg-amber-800 text-white font-bold py-4 rounded-xl text-base disabled:opacity-60"
        >
          {scanState === 'stamping' ? 'Sellando...' : '☕ Sellar visita'}
        </button>
      )}

      <button onClick={resetScan} className="w-full text-sm text-zinc-500 underline py-1">
        Buscar otro cliente
      </button>
    </div>
  ) : null

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 text-zinc-100 sticky top-0 z-20 shadow-lg shadow-black/40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-base">☕ Panel del empleado</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTab('scan')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${tab === 'scan' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}
            >
              Sellar
            </button>
            <button
              onClick={() => { setTab('dashboard'); resetScan() }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${tab === 'dashboard' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}
            >
              Clientes{pending.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">{pending.length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">

        {/* ────── TAB: SELLAR ────── */}
        {tab === 'scan' && (
          <>
            {/* Notificaciones de check-in */}
            {checkIns.map(c => (
              <div key={c.id} className="bg-green-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg animate-pulse">
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="font-bold">{c.name} está en el mostrador</p>
                  <p className="text-xs text-green-100">{c.phone} · {c.visits}/5 sellos</p>
                </div>
              </div>
            ))}

            {/* QR del negocio */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg shadow-black/30 p-5 text-center">
              <h2 className="font-bold text-amber-400 text-base mb-1">QR del negocio</h2>
              <p className="text-xs text-zinc-500 mb-4">
                Muéstralo para que los clientes se registren
              </p>
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-xl bg-white inline-block min-h-[172px] min-w-[172px] flex items-center justify-center">
                  {origin
                    ? <QRCode value={origin} size={160} />
                    : <span className="text-gray-300 text-sm">Cargando…</span>
                  }
                </div>
              </div>
              {origin && <p className="text-xs text-zinc-500 break-all">{origin}</p>}
            </div>

            {/* Sellar visita */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg shadow-black/30 p-5">
              <h2 className="font-bold text-amber-400 text-base mb-3">
                Sellar visita del cliente
              </h2>

              {scanError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm mb-3">
                  {scanError}
                </div>
              )}

              {/* Selector de método */}
              {scanMode === 'idle' && scanState === 'idle' && (
                <div className="space-y-3">
                  <button
                    onClick={() => { setScanError(''); setScanMode('camera'); setScanState('scanning') }}
                    className="w-full bg-amber-700 active:bg-amber-900 text-white font-bold py-4 rounded-xl text-base"
                  >
                    📷 Escanear QR del cliente
                  </button>
                  <button
                    onClick={() => { setScanError(''); setScanMode('phone') }}
                    className="w-full bg-zinc-800 border-2 border-zinc-700 text-amber-400 font-bold py-4 rounded-xl text-base active:bg-zinc-700"
                  >
                    🔍 Buscar por teléfono
                  </button>
                  <p className="text-xs text-zinc-500 text-center">
                    Si la cámara no abre, usa la búsqueda por teléfono
                  </p>
                </div>
              )}

              {/* Cámara */}
              {scanMode === 'camera' && scanState === 'scanning' && (
                <div>
                  <QRScanner
                    key={scanKey.current}
                    onScan={id => loadCustomer(id)}
                    onCameraError={handleCameraError}
                  />
                  <button onClick={resetScan} className="w-full mt-3 text-sm text-zinc-500 underline py-1">
                    Cancelar
                  </button>
                </div>
              )}

              {/* Búsqueda por teléfono */}
              {scanMode === 'phone' && scanState === 'idle' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-amber-400 mb-1">
                      Número de teléfono del cliente
                    </label>
                    <input
                      type="tel"
                      value={phoneSearch}
                      onChange={e => setPhoneSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && searchByPhone()}
                      placeholder="Ej. 55 1234 5678"
                      className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-lg"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={searchByPhone}
                    disabled={searching}
                    className="w-full bg-amber-700 active:bg-amber-900 text-white font-bold py-4 rounded-xl text-base disabled:opacity-60"
                  >
                    {searching ? 'Buscando...' : '🔍 Buscar cliente'}
                  </button>
                  <button onClick={resetScan} className="w-full text-sm text-zinc-500 underline py-1">
                    Cancelar
                  </button>
                </div>
              )}

              {/* Resultado del escaneo/búsqueda */}
              {scanState !== 'idle' && scanState !== 'scanning' && ScannedCard}
            </div>
          </>
        )}

        {/* ────── TAB: CLIENTES ────── */}
        {tab === 'dashboard' && (
          <>
            {/* Pendientes de activación */}
            {pending.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-bold text-red-400 flex items-center gap-2">
                  <span className="bg-red-500/15 text-red-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{pending.length}</span>
                  Pendientes de activación
                </h2>
                {pending.map(c => (
                  <div key={c.id} className="bg-zinc-900 border border-zinc-800 border-l-4 border-l-red-500 rounded-2xl shadow-lg shadow-black/30 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-zinc-100">{c.name}</p>
                        <p className="text-sm text-zinc-400">{c.phone}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Registrado: {fmt(c.registeredAt)}</p>
                      </div>
                      <span className="text-xs bg-red-500/15 text-red-300 font-semibold px-2 py-1 rounded-full">Pendiente</span>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => activateCustomer(c.id)}
                        className="w-full bg-amber-600 active:bg-amber-800 text-white font-bold py-2 rounded-xl text-sm"
                      >
                        ✅ Activar tarjeta ahora
                      </button>
                      <div className="flex gap-2">
                        <a
                          href={activationWALink(c)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-500 active:bg-green-700 text-white font-bold py-2 rounded-xl text-sm text-center"
                        >
                          💬 WhatsApp
                        </a>
                        <a
                          href={activationSMSLink(c)}
                          className="flex-1 bg-blue-500 active:bg-blue-700 text-white font-bold py-2 rounded-xl text-sm text-center"
                        >
                          ✉️ SMS
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                <hr className="border-zinc-800" />
              </div>
            )}

            {/* Clientes activos */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-amber-400 text-lg">
                Activos ({confirmed.length})
              </h2>
              <button onClick={loadCustomers} className="text-sm text-amber-400 underline">
                Actualizar
              </button>
>>>>>>> Stashed changes
            </div>
          </div>

<<<<<<< Updated upstream
          {/* Actividad de puntos */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Actividad de puntos</span>
              <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: S.sub }}>Este mes ▾</span>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Emitidos',  value: '+184,200', color: '#00e676' },
                  { label: 'Canjeados', value: '-52,400',  color: '#fbbf24' },
                  { label: 'Expirados', value: '-8,100',   color: '#ef4444' },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl" style={{ backgroundColor: S.elevated, border: `1px solid ${S.border}` }}>
                    <p className="text-xs mb-1" style={{ color: S.sub }}>{s.label}</p>
                    <p className="text-sm font-black" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
              {/* Bar chart */}
              <div className="flex items-end gap-3" style={{ height: 160 }}>
                {WEEKS.map((w, i) => (
                  <div key={w} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col-reverse gap-0.5">
                      <div className="w-full rounded-sm" style={{ height: `${(EMIT[i] / MAX_E) * 120}px`, backgroundColor: '#00e676' }} />
                      <div className="w-full rounded-sm" style={{ height: `${(CANJE[i] / MAX_E) * 120}px`, backgroundColor: '#fbbf24' }} />
                    </div>
                    <span className="text-xs" style={{ color: S.sub }}>{w}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-2">
                {[['#00e676','Emitidos'],['#fbbf24','Canjeados']].map(([c,l]) => (
                  <div key={l} className="flex items-center gap-1.5 text-xs" style={{ color: S.sub }}>
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />{l}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tarjetas digitales */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Tarjetas digitales</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { icon: '🍎', bg: 'rgba(168,85,247,.1)', text: 'Apple Wallet',  sub: '1,245 tarjetas activas', pct: '62%' },
                { icon: '🤖', bg: 'rgba(59,130,246,.1)', text: 'Google Wallet', sub: '768 tarjetas activas',   pct: '38%' },
              ].map(w => (
                <div key={w.text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: w.bg }}>{w.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: S.text }}>{w.text}</p>
                    <p className="text-xs" style={{ color: S.sub }}>{w.sub}</p>
                  </div>
                  <span className="font-bold text-sm" style={{ color: S.accent }}>{w.pct}</span>
=======
            {loadingList && <div className="text-center py-10 text-amber-400">Cargando...</div>}

            {!loadingList && confirmed.length === 0 && (
              <div className="text-center py-10 text-zinc-500">
                <p className="text-4xl mb-2">☕</p>
                <p>Aún no hay clientes activos</p>
              </div>
            )}

            {sortedConfirmed.map(c => {
              const lastStamp = c.stamps.at(-1)
              return (
                <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg shadow-black/30 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-zinc-100">{c.name}</p>
                      <p className="text-sm text-zinc-400">{c.phone}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.visits >= 5 ? 'bg-green-500/15 text-green-300' : 'bg-amber-500/15 text-amber-300'}`}>
                      {c.visits >= 5 ? '🎉 Premio' : `${c.visits}/5 ☕`}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`flex-1 h-2 rounded-full ${i < c.visits ? 'bg-amber-500' : 'bg-zinc-700'}`} />
                    ))}
                  </div>
                  <div className="text-xs text-zinc-500 space-y-0.5">
                    <p>Registrado: {fmt(c.registeredAt)}</p>
                    {lastStamp && <p>Último sello: {fmt(lastStamp.timestamp)}</p>}
                    {c.stamps.length > 0 && <p>{c.stamps.length} sello{c.stamps.length !== 1 ? 's' : ''} en total</p>}
                  </div>
                  <button
                    onClick={() => deleteCustomerFn(c.id)}
                    className="mt-3 w-full text-red-400 border border-red-500/30 rounded-xl py-1.5 text-sm font-medium active:bg-red-500/10"
                  >
                    🗑 Eliminar cliente
                  </button>
>>>>>>> Stashed changes
                </div>
              ))}
              <div className="p-3 rounded-xl" style={{ backgroundColor: S.elevated, border: `1px solid ${S.border}` }}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs" style={{ color: S.sub }}>Tasa de adopción</span>
                  <span className="text-xs font-bold" style={{ color: S.text }}>71%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,.06)' }}>
                  <div className="h-1.5 rounded-full" style={{ width: '71%', background: 'linear-gradient(90deg,#00e676,#06b6d4)' }} />
                </div>
              </div>
              {[
                { icon: '📲', bg: 'rgba(0,230,118,.1)',  text: 'Push enviados (mes)',  sub: '4,520 notificaciones',           pct: '89% entrega' },
                { icon: '🔄', bg: 'rgba(251,191,36,.1)', text: 'Updates de tarjeta',   sub: 'Puntos y tier en tiempo real',   pct: null },
              ].map(a => (
                <div key={a.text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: a.bg }}>{a.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: S.text }}>{a.text}</p>
                    <p className="text-xs" style={{ color: S.sub }}>{a.sub}</p>
                  </div>
                  {a.pct
                    ? <span className="text-xs font-bold shrink-0" style={{ color: S.text }}>{a.pct}</span>
                    : <span className="flex items-center gap-1 text-xs shrink-0" style={{ color: S.accent }}><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: S.accent }} />Activo</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Top clientes */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Top clientes fidelizados</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { rank: 1, rc: '#c084fc', bg: 'linear-gradient(135deg,#c084fc,#7c3aed)', emoji: '💎', name: 'Roberto García', tier: 'Platinum · 45 visitas', pts: '15,200 pts', ltv: '$89,200 LTV' },
                { rank: 2, rc: '#fbbf24', bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)', emoji: '⭐', name: 'Ana Martínez',   tier: 'Gold · 23 visitas',     pts: '8,450 pts',  ltv: '$47,500 LTV' },
                { rank: 3, rc: '#f59e0b', bg: 'linear-gradient(135deg,#fbbf24,#b45309)', emoji: '⭐', name: 'Lucía Pérez',    tier: 'Gold · 15 visitas',     pts: '6,800 pts',  ltv: '$31,000 LTV' },
                { rank: 4, rc: '#60a5fa', bg: 'linear-gradient(135deg,#60a5fa,#3b82f6)', emoji: '🥈', name: 'Carlos Mendoza', tier: 'Silver · 12 visitas',   pts: '3,200 pts',  ltv: '$22,800 LTV' },
              ].map(p => (
                <div key={p.rank} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0" style={{ backgroundColor: `${p.rc}20`, color: p.rc }}>{p.rank}</div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: p.bg }}>{p.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: S.text }}>{p.name}</p>
                    <p className="text-xs" style={{ color: S.sub }}>{p.tier}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: S.text }}>{p.pts}</p>
                    <p className="text-xs" style={{ color: S.sub }}>{p.ltv}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3" style={{ borderTop: `1px solid ${S.border}` }}>
              <span className="text-xs font-semibold" style={{ color: S.accent }}>Ver todos los miembros →</span>
            </div>
          </div>

          {/* Rewards */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Rewards más canjeados</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { rank: 1, rc: '#c084fc', emoji: '🍰', name: 'Postre gratis',         sub: '500 pts · 142 canjes',   pct: '41.5%' },
                { rank: 2, rc: '#fbbf24', emoji: '🍹', name: 'Bebida 2x1',            sub: '300 pts · 98 canjes',    pct: '28.6%' },
                { rank: 3, rc: '#60a5fa', emoji: '💸', name: '$200 de descuento',     sub: '1,000 pts · 64 canjes',  pct: '18.7%' },
                { rank: 4, rc: '#94a3b8', emoji: '🍽️', name: 'Plato principal gratis', sub: '2,500 pts · 38 canjes', pct: '11.1%' },
              ].map(p => (
                <div key={p.rank} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0" style={{ backgroundColor: `${p.rc}20`, color: p.rc }}>{p.rank}</div>
                  <span className="text-xl shrink-0">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: S.text }}>{p.name}</p>
                    <p className="text-xs" style={{ color: S.sub }}>{p.sub}</p>
                  </div>
                  <span className="text-sm font-bold shrink-0" style={{ color: S.accent }}>{p.pct}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3" style={{ borderTop: `1px solid ${S.border}` }}>
              <span className="text-xs font-semibold" style={{ color: S.accent }}>Gestionar rewards →</span>
            </div>
          </div>

          {/* Cupones */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-bold text-sm" style={{ color: S.text }}>Cupones automáticos</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { icon: '🎂', bg: 'rgba(251,191,36,.1)', name: 'Cupón Cumpleaños',   sub: 'Postre gratis · 34 enviados' },
                { icon: '💔', bg: 'rgba(239,68,68,.1)',  name: 'Recuperación churn', sub: '20% off · 15d sin volver'    },
                { icon: '👋', bg: 'rgba(0,230,118,.1)',  name: 'Bienvenida',          sub: '10% primera compra'          },
                { icon: '🏆', bg: 'rgba(168,85,247,.1)', name: 'Ascenso de tier',    sub: 'Reward sorpresa al subir'    },
              ].map(c => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: c.bg }}>{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: S.text }}>{c.name}</p>
                    <p className="text-xs" style={{ color: S.sub }}>{c.sub}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium shrink-0" style={{ color: S.accent }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: S.accent }} />Activo
                  </span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3" style={{ borderTop: `1px solid ${S.border}` }}>
              <span className="text-xs font-semibold" style={{ color: S.accent }}>Ver todas las automatizaciones →</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
