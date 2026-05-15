'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { QRScanner } from '../components/QRScanner'

// Cargado sólo en cliente para evitar problemas de renderizado en móvil
const QRCode = dynamic(() => import('react-qr-code'), { ssr: false })

interface Stamp {
  timestamp: string
  visitsAfter: number
}

interface Customer {
  id: string
  name: string
  phone: string
  visits: number
  confirmed: boolean
  registeredAt: string
  stamps: Stamp[]
}

type ScanMode = 'idle' | 'camera' | 'phone'
type ScanState = 'idle' | 'scanning' | 'found' | 'stamping' | 'done'
type Tab = 'scan' | 'dashboard'

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

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
  const sortedConfirmed = [...confirmed].sort((a, b) => {
    const aT = a.stamps.at(-1)?.timestamp ?? a.registeredAt
    const bT = b.stamps.at(-1)?.timestamp ?? b.registeredAt
    return bT.localeCompare(aT)
  })

  // Bloque reutilizable: muestra info del cliente escaneado + botón de sello
  const ScannedCard = scanned ? (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="font-bold text-amber-900 text-lg">{scanned.name}</p>
            <p className="text-gray-600 text-sm">{scanned.phone}</p>
          </div>
          <div className="text-right">
            <span className={`text-3xl font-bold ${scanned.visits >= 5 ? 'text-green-600' : 'text-amber-700'}`}>
              {scanned.visits}/5
            </span>
            <p className="text-xs text-gray-500">visitas</p>
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-8 rounded-full flex items-center justify-center text-sm ${i < scanned.visits ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-200'}`}
            >
              ☕
            </div>
          ))}
        </div>
      </div>

      {!scanned.confirmed ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center text-sm">
          Este cliente aún no activó su tarjeta. Envíale el link desde la pestaña Clientes.
        </div>
      ) : scanState === 'done' ? (
        <div className="bg-green-100 text-green-800 rounded-xl p-4 text-center font-bold">
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

      <button onClick={resetScan} className="w-full text-sm text-gray-500 underline py-1">
        Buscar otro cliente
      </button>
    </div>
  ) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-amber-900 text-white sticky top-0 z-20 shadow">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-base">☕ Panel del empleado</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTab('scan')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${tab === 'scan' ? 'bg-white text-amber-900' : 'bg-amber-800 text-white'}`}
            >
              Sellar
            </button>
            <button
              onClick={() => { setTab('dashboard'); resetScan() }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${tab === 'dashboard' ? 'bg-white text-amber-900' : 'bg-amber-800 text-white'}`}
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
            {/* QR del negocio */}
            <div className="bg-white rounded-2xl shadow p-5 text-center">
              <h2 className="font-bold text-amber-900 text-base mb-1">QR del negocio</h2>
              <p className="text-xs text-gray-500 mb-4">
                Muéstralo para que los clientes se registren
              </p>
              <div className="flex justify-center mb-3">
                <div className="p-3 border-2 border-amber-200 rounded-xl bg-white inline-block min-h-[172px] min-w-[172px] flex items-center justify-center">
                  {origin
                    ? <QRCode value={origin} size={160} />
                    : <span className="text-gray-300 text-sm">Cargando…</span>
                  }
                </div>
              </div>
              {origin && <p className="text-xs text-gray-400 break-all">{origin}</p>}
            </div>

            {/* Sellar visita */}
            <div className="bg-white rounded-2xl shadow p-5">
              <h2 className="font-bold text-amber-900 text-base mb-3">
                Sellar visita del cliente
              </h2>

              {scanError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-3">
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
                    className="w-full bg-white border-2 border-amber-300 text-amber-800 font-bold py-4 rounded-xl text-base active:bg-amber-50"
                  >
                    🔍 Buscar por teléfono
                  </button>
                  <p className="text-xs text-gray-400 text-center">
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
                  <button onClick={resetScan} className="w-full mt-3 text-sm text-gray-500 underline py-1">
                    Cancelar
                  </button>
                </div>
              )}

              {/* Búsqueda por teléfono */}
              {scanMode === 'phone' && scanState === 'idle' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-amber-900 mb-1">
                      Número de teléfono del cliente
                    </label>
                    <input
                      type="tel"
                      value={phoneSearch}
                      onChange={e => setPhoneSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && searchByPhone()}
                      placeholder="Ej. 55 1234 5678"
                      className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 text-lg"
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
                  <button onClick={resetScan} className="w-full text-sm text-gray-500 underline py-1">
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
                <h2 className="font-bold text-red-700 flex items-center gap-2">
                  <span className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{pending.length}</span>
                  Pendientes de activación
                </h2>
                {pending.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl shadow border-l-4 border-red-400 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{c.name}</p>
                        <p className="text-sm text-gray-500">{c.phone}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Registrado: {fmt(c.registeredAt)}</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-1 rounded-full">Pendiente</span>
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
                <hr className="border-gray-200" />
              </div>
            )}

            {/* Clientes activos */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-amber-900 text-lg">
                Activos ({confirmed.length})
              </h2>
              <button onClick={loadCustomers} className="text-sm text-amber-700 underline">
                Actualizar
              </button>
            </div>

            {loadingList && <div className="text-center py-10 text-amber-700">Cargando...</div>}

            {!loadingList && confirmed.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">☕</p>
                <p>Aún no hay clientes activos</p>
              </div>
            )}

            {sortedConfirmed.map(c => {
              const lastStamp = c.stamps.at(-1)
              return (
                <div key={c.id} className="bg-white rounded-2xl shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{c.name}</p>
                      <p className="text-sm text-gray-500">{c.phone}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.visits >= 5 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {c.visits >= 5 ? '🎉 Premio' : `${c.visits}/5 ☕`}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`flex-1 h-2 rounded-full ${i < c.visits ? 'bg-amber-500' : 'bg-gray-100'}`} />
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <p>Registrado: {fmt(c.registeredAt)}</p>
                    {lastStamp && <p>Último sello: {fmt(lastStamp.timestamp)}</p>}
                    {c.stamps.length > 0 && <p>{c.stamps.length} sello{c.stamps.length !== 1 ? 's' : ''} en total</p>}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
