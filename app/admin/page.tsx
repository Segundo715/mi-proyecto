'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { QRScanner } from '../components/QRScanner'
import AdminNav from '../components/AdminNav'

const QRCode = dynamic(() => import('react-qr-code'), { ssr: false })

interface LoyaltyCard {
  id: string; name: string; phone: string; visits: number
  registeredAt: string; stamps: { timestamp: string }[]
}

const AVATAR_COLORS = ['bg-amber-500','bg-rose-500','bg-violet-500','bg-sky-500','bg-emerald-500','bg-orange-500']
function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] }
function initial(name: string) { return name.trim().charAt(0).toUpperCase() }

type ScanMode = 'idle' | 'camera' | 'phone'
type ScanState = 'idle' | 'scanning' | 'found' | 'stamping' | 'done'

const STAMPS = 5

export default function AdminPage() {
  const [origin, setOrigin] = useState('')
  const [scanMode, setScanMode] = useState<ScanMode>('idle')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [scanned, setScanned] = useState<LoyaltyCard | null>(null)
  const [scanError, setScanError] = useState('')
  const [phoneSearch, setPhoneSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [loyaltyCards, setLoyaltyCards] = useState<LoyaltyCard[]>([])
  const [cardSearch, setCardSearch] = useState('')
  const scanKey = useRef(0)

  useEffect(() => {
    setOrigin(window.location.origin)
    loadCards()
    const poll = setInterval(loadCards, 8000)
    return () => clearInterval(poll)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCards() {
    const res = await fetch('/api/loyalty')
    if (res.ok) setLoyaltyCards(await res.json())
  }

  async function loadCard(id: string) {
    setScanState('found'); setScanError('')
    const res = await fetch(`/api/loyalty/${id}`)
    if (res.ok) setScanned(await res.json())
    else { setScanError('Tarjeta no encontrada.'); setScanState('idle') }
  }

  async function searchByPhone() {
    const q = phoneSearch.replace(/\D/g, '')
    if (q.length < 6) { setScanError('Ingresa al menos 6 dígitos.'); return }
    setSearching(true); setScanError('')
    const match = loyaltyCards.find(c => c.phone.replace(/\D/g, '').includes(q))
    if (match) { setScanned(match); setScanState('found') }
    else setScanError('No se encontró ninguna tarjeta con ese número.')
    setSearching(false)
  }

  async function stampVisit() {
    if (!scanned) return
    setScanState('stamping')
    const res = await fetch(`/api/loyalty/${scanned.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stamp' }),
    })
    if (res.ok) { setScanned(await res.json()); setScanState('done'); loadCards() }
    else { setScanState('found'); setScanError('Error al registrar la visita.') }
  }

  async function redeemCoffee() {
    if (!scanned) return
    setScanState('stamping')
    const res = await fetch(`/api/loyalty/${scanned.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'redeem' }),
    })
    if (res.ok) { setScanned(await res.json()); setScanState('done'); loadCards() }
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

        {/* Business QR */}
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <h2 className="font-black text-amber-900 text-base mb-1">QR del negocio</h2>
          <p className="text-xs text-gray-400 mb-4">Los clientes escanean este para registrarse</p>
          <div className="flex justify-center mb-3">
            <div className="p-3 border-2 border-amber-100 rounded-2xl bg-white inline-flex items-center justify-center min-h-[172px] min-w-[172px]">
              {origin ? <QRCode value={`${origin}/loyalty`} size={160} /> : <span className="text-gray-300 text-sm">Cargando…</span>}
            </div>
          </div>
          {origin && <p className="text-xs text-gray-400 break-all">{origin}/loyalty</p>}
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
                <QRScanner key={scanKey.current} onScan={id => loadCard(id)}
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

                {scanState === 'done' ? (
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

        {/* Active loyalty cards */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="bg-amber-800 px-5 py-3 flex items-center justify-between">
            <h2 className="font-black text-white text-base">☕ Tarjetas activas</h2>
            <span className="text-amber-300 text-xs font-bold">{loyaltyCards.length}</span>
          </div>
          <div className="p-3 space-y-2">
            <input
              type="text"
              value={cardSearch}
              onChange={e => setCardSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-amber-400"
            />
            {loyaltyCards
              .filter(c => !cardSearch.trim() || c.name.toLowerCase().includes(cardSearch.toLowerCase()) || c.phone.includes(cardSearch))
              .slice(0, 15)
              .map(c => (
                <button key={c.id} type="button"
                  onClick={() => { loadCard(c.id); setScanMode('camera') }}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors active:scale-[0.98] ${
                    c.visits >= STAMPS ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50 hover:bg-amber-50'
                  }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base shrink-0 ${avatarColor(c.name)}`}>
                    {initial(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{c.name}</p>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: STAMPS }).map((_, i) => (
                        <div key={i} className={`w-4 h-1.5 rounded-full ${i < c.visits ? 'bg-amber-500' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {c.visits >= STAMPS
                      ? <span className="text-lg">🎉</span>
                      : <span className="text-sm font-black text-amber-700">{c.visits}/{STAMPS}</span>
                    }
                  </div>
                </button>
              ))}
            {loyaltyCards.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">Aún no hay tarjetas registradas</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
