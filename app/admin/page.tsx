'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { QRScanner } from '../components/QRScanner'
import AdminNav from '../components/AdminNav'

const QRCode = dynamic(() => import('react-qr-code'), { ssr: false })

interface Customer {
  id: string; name: string; phone: string; visits: number
  confirmed: boolean; registeredAt: string; requestedAt?: string
}

type ScanMode = 'idle' | 'camera' | 'phone'
type ScanState = 'idle' | 'scanning' | 'found' | 'stamping' | 'done'

const STAMPS = 5

export default function AdminPage() {
  const [origin, setOrigin] = useState('')
  const [scanMode, setScanMode] = useState<ScanMode>('idle')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [scanned, setScanned] = useState<Customer | null>(null)
  const [scanError, setScanError] = useState('')
  const [phoneSearch, setPhoneSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [checkIns, setCheckIns] = useState<Customer[]>([])
  const scanKey = useRef(0)

  useEffect(() => {
    setOrigin(window.location.origin)
    loadCheckIns()
    const poll = setInterval(loadCheckIns, 8000)
    return () => clearInterval(poll)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCheckIns() {
    const res = await fetch('/api/customers')
    if (res.ok) {
      const all: Customer[] = await res.json()
      setCheckIns(all.filter(c => {
        if (!c.requestedAt) return false
        return Date.now() - new Date(c.requestedAt).getTime() < 3 * 60 * 1000
      }))
    }
  }

  async function loadCustomer(id: string) {
    setScanState('found'); setScanError('')
    const res = await fetch(`/api/customers/${id}`)
    if (res.ok) setScanned(await res.json())
    else { setScanError('Cliente no encontrado.'); setScanState('idle') }
  }

  async function searchByPhone() {
    const q = phoneSearch.replace(/\D/g, '')
    if (q.length < 6) { setScanError('Ingresa al menos 6 dígitos.'); return }
    setSearching(true); setScanError('')
    const res = await fetch('/api/customers')
    if (res.ok) {
      const all: Customer[] = await res.json()
      const match = all.find(c => c.phone.replace(/\D/g, '').includes(q) && c.confirmed)
      if (match) { setScanned(match); setScanState('found') }
      else setScanError('No se encontró ningún cliente confirmado con ese número.')
    }
    setSearching(false)
  }

  async function stampVisit() {
    if (!scanned) return
    setScanState('stamping')
    const res = await fetch(`/api/customers/${scanned.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stamp' }),
    })
    if (res.ok) { setScanned(await res.json()); setScanState('done') }
    else { setScanState('found'); setScanError('Error al registrar la visita.') }
  }

  async function redeemCoffee() {
    if (!scanned) return
    setScanState('stamping')
    const res = await fetch(`/api/customers/${scanned.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'redeem' }),
    })
    if (res.ok) { setScanned(await res.json()); setScanState('done') }
    else setScanState('found')
  }

  function resetScan() {
    scanKey.current += 1
    setScanMode('idle'); setScanState('idle'); setScanned(null)
    setScanError(''); setPhoneSearch('')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="max-w-lg mx-auto p-4 space-y-4">

        {/* Check-in alerts */}
        {checkIns.map(c => (
          <div key={c.id} className="bg-green-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <span className="text-3xl animate-bounce">🔔</span>
            <div className="flex-1">
              <p className="font-black text-base">{c.name} está en el mostrador</p>
              <p className="text-xs text-green-100">{c.phone} · {c.visits}/{STAMPS} sellos</p>
            </div>
          </div>
        ))}

        {/* Business QR */}
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <h2 className="font-black text-amber-900 text-base mb-1">QR del negocio</h2>
          <p className="text-xs text-gray-400 mb-4">Los clientes escanean este para registrarse</p>
          <div className="flex justify-center mb-3">
            <div className="p-3 border-2 border-amber-100 rounded-2xl bg-white inline-flex items-center justify-center min-h-[172px] min-w-[172px]">
              {origin ? <QRCode value={origin} size={160} /> : <span className="text-gray-300 text-sm">Cargando…</span>}
            </div>
          </div>
          {origin && <p className="text-xs text-gray-400 break-all">{origin}</p>}
        </div>

        {/* Stamp visit */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="bg-amber-900 px-5 py-3">
            <h2 className="font-black text-white text-base">Sellar visita</h2>
          </div>

          <div className="p-5 space-y-3">
            {scanError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{scanError}</div>
            )}

            {scanMode === 'idle' && scanState === 'idle' && (
              <div className="space-y-3">
                <button type="button"
                  onClick={() => { setScanError(''); setScanMode('camera'); setScanState('scanning') }}
                  className="w-full bg-amber-700 active:bg-amber-900 text-white font-black py-4 rounded-2xl text-base transition-colors">
                  📷 Escanear QR del cliente
                </button>
                <button type="button"
                  onClick={() => { setScanError(''); setScanMode('phone') }}
                  className="w-full bg-white border-2 border-amber-200 text-amber-800 font-bold py-4 rounded-2xl text-base active:bg-amber-50 transition-colors">
                  🔍 Buscar por teléfono
                </button>
              </div>
            )}

            {scanMode === 'camera' && scanState === 'scanning' && (
              <div>
                <QRScanner key={scanKey.current} onScan={id => loadCustomer(id)}
                  onCameraError={() => { setScanError('Cámara no disponible. Usa búsqueda por teléfono.'); setScanMode('idle') }} />
                <button type="button" onClick={resetScan} className="w-full mt-3 text-sm text-gray-400 underline py-1">Cancelar</button>
              </div>
            )}

            {scanMode === 'phone' && scanState === 'idle' && (
              <div className="space-y-3">
                <input type="tel" value={phoneSearch}
                  onChange={e => setPhoneSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchByPhone()}
                  placeholder="Número de teléfono"
                  className="w-full border-2 border-amber-200 rounded-2xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:border-amber-500 text-lg"
                  autoFocus />
                <button type="button" onClick={searchByPhone} disabled={searching}
                  className="w-full bg-amber-700 active:bg-amber-900 text-white font-black py-4 rounded-2xl text-base disabled:opacity-60">
                  {searching ? 'Buscando...' : '🔍 Buscar'}
                </button>
                <button type="button" onClick={resetScan} className="w-full text-sm text-gray-400 underline py-1">Cancelar</button>
              </div>
            )}

            {scanState !== 'idle' && scanState !== 'scanning' && scanned && (
              <div className="space-y-4">
                {/* Customer card */}
                <div className="bg-amber-900 rounded-2xl p-5 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-2xl leading-tight">{scanned.name}</p>
                      <p className="text-amber-300 text-sm">{scanned.phone}</p>
                    </div>
                    <span className={`text-3xl font-black ${scanned.visits >= STAMPS ? 'text-yellow-400' : 'text-amber-300'}`}>
                      {scanned.visits}/{STAMPS}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: STAMPS }).map((_, i) => (
                      <div key={i} className={`aspect-square rounded-full flex items-center justify-center text-xl border-2 transition-all ${
                        i < scanned.visits
                          ? 'bg-amber-500 border-amber-400'
                          : 'bg-amber-800 border-amber-700'
                      }`}>
                        {i < scanned.visits ? '☕' : '○'}
                      </div>
                    ))}
                  </div>
                </div>

                {!scanned.confirmed ? (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl p-4 text-center font-semibold text-sm">
                    ⚠️ Este cliente aún no activó su tarjeta.
                  </div>
                ) : scanState === 'done' ? (
                  <div className="bg-green-50 border-2 border-green-300 text-green-800 rounded-2xl p-4 text-center font-black text-base">
                    ✅ ¡Visita sellada! — {scanned.visits}/{STAMPS} sellos
                  </div>
                ) : scanned.visits >= STAMPS ? (
                  <button type="button" onClick={redeemCoffee} disabled={scanState === 'stamping'}
                    className="w-full bg-yellow-400 active:bg-yellow-500 text-amber-900 font-black py-4 rounded-2xl text-base disabled:opacity-60">
                    {scanState === 'stamping' ? 'Canjeando...' : '🎉 Canjear café gratis'}
                  </button>
                ) : (
                  <button type="button" onClick={stampVisit} disabled={scanState === 'stamping'}
                    className="w-full bg-amber-700 active:bg-amber-900 text-white font-black py-4 rounded-2xl text-base disabled:opacity-60">
                    {scanState === 'stamping' ? 'Sellando...' : '☕ Sellar visita'}
                  </button>
                )}

                <button type="button" onClick={resetScan} className="w-full text-sm text-gray-400 underline py-1">
                  Buscar otro cliente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
