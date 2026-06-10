'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

export type AIRole = 'cook' | 'staff' | 'customer' | 'admin' | 'recipe'
export interface QuickAction { label: string; message: string; emoji?: string }
interface MenuItem { id: string; name: string; price: number; imageUrl?: string; description: string; available: boolean }
interface Msg { role: 'user' | 'assistant'; content: string; cards?: MenuItem[] }

const CFG: Record<AIRole, { title: string; icon: string; placeholder: string; greeting: string }> = {
  cook:     { title: 'Asistente Cocina',  icon: '👨‍🍳', placeholder: '¿Pasos de una receta? ¿Pedidos activos?', greeting: '¡Hola! Tengo pedidos y recetario en tiempo real. Toca una receta abajo o pregúntame algo.' },
  staff:    { title: 'Asistente',         icon: '🤖',   placeholder: '¿Pedidos pendientes? ¿Estado de mesa?',   greeting: '¡Hola! Puedo darte info de pedidos activos, tiempos y menú. ¿En qué te ayudo?' },
  customer: { title: 'Asistente',         icon: '💬',   placeholder: 'Habla o escribe… ¿Qué te recomiendo?',    greeting: '¡Hola! Puedo recomendarte platillos, decirte el estado de tu pedido o el tiempo estimado. ¿Qué necesitas? 🎤 Puedes hablarme.' },
  admin:    { title: 'Asistente Admin',   icon: '📊',   placeholder: 'Ventas de hoy, pedidos, tendencias…',     greeting: '¡Hola! Tengo todos los datos del restaurante en tiempo real. ¿Qué quieres saber?' },
  recipe:   { title: 'Chef IA',           icon: '📖',   placeholder: '¿Cómo se prepara…? ¿Puedo sustituir…?',  greeting: '¡Hola! Soy tu chef virtual. Puedo explicarte recetas paso a paso o sugerirte variaciones. ¿En qué te ayudo?' },
}

function getRoleFromPath(path: string): AIRole {
  if (path.includes('/resta3/cocina'))                       return 'cook'
  if (path.includes('/resta3'))                              return 'staff'
  if (path.includes('/admin'))                               return 'admin'
  if (path.includes('/reseta') || path.includes('/receta'))  return 'recipe'
  return 'customer'
}

// Detecta nombres de platillos mencionados por la IA
function findMentioned(text: string, items: MenuItem[]): MenuItem[] {
  const lower = text.toLowerCase()
  return items.filter(item => lower.includes(item.name.toLowerCase()) && item.name.length > 4)
}

// Tarjeta de platillo recomendado
function DishCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const [added, setAdded] = useState(false)
  function handle() {
    setAdded(true)
    onAdd(item)
    setTimeout(() => setAdded(false), 2000)
  }
  return (
    <div className="rounded-2xl overflow-hidden shrink-0 w-40 flex flex-col"
      style={{ backgroundColor: 'var(--ad-bg,#0a0d14)', border: '1px solid var(--ad-accent,#f59e0b)33' }}>
      {item.imageUrl
        ? <img src={item.imageUrl} alt={item.name} className="w-full h-24 object-cover" />
        : <div className="w-full h-20 flex items-center justify-center text-3xl" style={{ backgroundColor: 'var(--ad-accent,#f59e0b)11' }}>🍽️</div>}
      <div className="p-2 flex flex-col flex-1 gap-1">
        <p className="text-xs font-black leading-tight" style={{ color: 'var(--ad-text,#f1f5f9)' }}>{item.name}</p>
        {item.description && <p className="text-[10px] leading-tight opacity-70 line-clamp-2" style={{ color: 'var(--ad-text,#f1f5f9)' }}>{item.description}</p>}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-xs font-black" style={{ color: 'var(--ad-accent,#f59e0b)' }}>${item.price}</span>
          <button onClick={handle}
            className="text-[10px] font-black px-2 py-1 rounded-xl transition-all"
            style={added
              ? { backgroundColor: '#22c55e22', color: '#22c55e' }
              : { backgroundColor: 'var(--ad-accent,#f59e0b)', color: '#000' }}>
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AIChat({
  role: roleProp,
  quickActions,
  position = 'bottom-right',
}: {
  role?: AIRole
  quickActions?: QuickAction[]
  position?: 'bottom-right' | 'bottom-left'
}) {
  const pathname  = usePathname()
  const role      = roleProp ?? getRoleFromPath(pathname)
  const cfg       = CFG[role]

  const [open,        setOpen]        = useState(false)
  const [msgs,        setMsgs]        = useState<Msg[]>([{ role: 'assistant', content: cfg.greeting }])
  const [input,       setInput]       = useState('')
  const [busy,        setBusy]        = useState(false)
  const [actionsUsed, setActionsUsed] = useState(false)
  const [autoActions, setAutoActions] = useState<QuickAction[]>([])
  const [menuItems,   setMenuItems]   = useState<MenuItem[]>([])
  const [listening,   setListening]   = useState(false)
  const [voiceOn,     setVoiceOn]     = useState(false)
  const [voiceAvail,  setVoiceAvail]  = useState(false)

  const bottomRef    = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)
  const recogRef     = useRef<any>(null)
  const abortRef     = useRef<AbortController | null>(null)

  // Verificar soporte de voz
  useEffect(() => {
    setVoiceAvail(!!(
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    ))
  }, [])

  // Cargar recetas para cocinero
  useEffect(() => {
    if (role !== 'cook') return
    fetch('/api/recipes')
      .then(r => r.json())
      .then((data: { name: string }[]) => {
        if (!Array.isArray(data)) return
        setAutoActions(data.map(r => ({
          emoji: '📖',
          label: r.name,
          message: `Explícame paso a paso cómo preparar "${r.name}". Primero los ingredientes y luego los pasos numerados.`,
        })))
      })
      .catch(() => {})
  }, [role])

  // Cargar menú para cliente (recomendaciones visuales)
  useEffect(() => {
    if (role !== 'customer') return
    fetch('/api/menu')
      .then(r => r.json())
      .then((data: MenuItem[]) => { if (Array.isArray(data)) setMenuItems(data.filter(m => m.available)) })
      .catch(() => {})
  }, [role])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120) }, [open])

  // Síntesis de voz (respuesta de la IA)
  const speak = useCallback((text: string) => {
    if (!voiceOn || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const clean = text.replace(/[*_`#[\]]/g, '').slice(0, 500) // máx 500 chars para voz
    const utter = new SpeechSynthesisUtterance(clean)
    utter.lang = 'es-MX'
    utter.rate = 1.05
    window.speechSynthesis.speak(utter)
  }, [voiceOn])

  // Reconocimiento de voz
  function toggleListening() {
    if (listening) {
      recogRef.current?.stop()
      setListening(false)
      return
    }
    const R = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!R) return
    const rec = new R()
    rec.lang = 'es-MX'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e: any) => {
      const text: string = e.results[0][0].transcript
      setListening(false)
      setInput(text)
      // auto-enviar
      setTimeout(() => sendMessage(text), 50)
    }
    rec.onerror  = () => setListening(false)
    rec.onend    = () => setListening(false)
    recogRef.current = rec
    rec.start()
    setListening(true)
  }

  async function sendMessage(text: string) {
    const txt = text.trim()
    if (!txt || busy) return
    setInput('')
    setActionsUsed(true)

    const history: Msg[] = [...msgs, { role: 'user', content: txt }]
    setMsgs([...history, { role: 'assistant', content: '' }])
    setBusy(true)

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    // Timeout de 25 segundos
    const timer = setTimeout(() => ctrl.abort(), 25000)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          role,
        }),
        signal: ctrl.signal,
      })

      clearTimeout(timer)

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body!.getReader()
      const dec    = new TextDecoder()
      let acc      = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += dec.decode(value, { stream: true })
        const snap = acc
        setMsgs(prev => {
          const u = [...prev]
          u[u.length - 1] = { role: 'assistant', content: snap }
          return u
        })
      }

      // Adjuntar tarjetas de platillos mencionados
      if (role === 'customer' && menuItems.length > 0) {
        const cards = findMentioned(acc, menuItems).slice(0, 6)
        if (cards.length > 0) {
          setMsgs(prev => {
            const u = [...prev]
            u[u.length - 1] = { ...u[u.length - 1], cards }
            return u
          })
        }
      }

      speak(acc)

    } catch (e: any) {
      clearTimeout(timer)
      const isAbort = e.name === 'AbortError'
      setMsgs(prev => {
        const u = [...prev]
        u[u.length - 1] = {
          role: 'assistant',
          content: isAbort
            ? 'La respuesta tardó demasiado. ¿Puedes intentarlo de nuevo?'
            : 'No pude conectar. Revisa tu conexión e intenta de nuevo.',
        }
        return u
      })
    }

    setBusy(false)
  }

  function addToCart(item: MenuItem) {
    window.dispatchEvent(new CustomEvent('ai-add-to-cart', { detail: item }))
  }

  const effectiveActions = quickActions ?? (role === 'cook' && autoActions.length > 0 ? autoActions : undefined)
  const posClass         = position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6'

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className={`fixed ${posClass} z-[200] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95`}
          style={{ background: 'linear-gradient(135deg,var(--ad-accent,#f59e0b),#06b6d4)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {cfg.icon}
        </button>
      )}

      {/* Panel de chat */}
      {open && (
        <div className={`fixed ${posClass} z-[200] flex flex-col rounded-3xl shadow-2xl overflow-hidden`}
          style={{ width: 360, height: 580, backgroundColor: 'var(--ad-card,#1a1d27)', border: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid var(--ad-border,rgba(255,255,255,0.08))', background: 'linear-gradient(135deg,var(--ad-accent,#f59e0b)18,#06b6d418)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{cfg.icon}</span>
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--ad-text,#f1f5f9)' }}>{cfg.title}</p>
                <p className="text-[10px]" style={{ color: 'var(--ad-accent,#f59e0b)' }}>● Datos en tiempo real · Llama 3</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Toggle voz de respuesta */}
              <button onClick={() => setVoiceOn(v => !v)}
                title={voiceOn ? 'Silenciar respuestas' : 'Activar voz'}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all"
                style={voiceOn
                  ? { backgroundColor: 'var(--ad-accent,#f59e0b)', color: '#000' }
                  : { backgroundColor: 'var(--ad-bg,#0a0d14)', color: 'var(--ad-sub,#64748b)' }}>
                🔊
              </button>
              <button onClick={() => { setMsgs([{ role: 'assistant', content: cfg.greeting }]); setActionsUsed(false) }}
                className="text-[10px] px-2 py-1 rounded-lg" style={{ color: 'var(--ad-sub,#64748b)', backgroundColor: 'var(--ad-bg,#0a0d14)' }}>
                ↺
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                style={{ color: 'var(--ad-sub,#64748b)', backgroundColor: 'var(--ad-bg,#0a0d14)' }}>✕</button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {msgs.map((m, i) => (
              <div key={i}>
                <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[88%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words leading-relaxed"
                    style={m.role === 'user'
                      ? { background: 'var(--ad-accent,#f59e0b)', color: '#000' }
                      : { background: 'var(--ad-bg,#0a0d14)', color: 'var(--ad-text,#f1f5f9)', border: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}>
                    {m.content || (busy && i === msgs.length - 1
                      ? <span className="inline-flex gap-1 opacity-60">
                          {['0ms','150ms','300ms'].map((d, j) => <span key={j} className="animate-bounce" style={{ animationDelay: d }}>●</span>)}
                        </span>
                      : null)}
                  </div>
                </div>

                {/* Tarjetas de platillos recomendados */}
                {m.cards && m.cards.length > 0 && (
                  <div className="mt-2 ml-1">
                    <p className="text-[10px] font-bold mb-1.5 px-1" style={{ color: 'var(--ad-accent,#f59e0b)' }}>
                      ✨ Toca para agregar al carrito
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {m.cards.map(item => (
                        <DishCard key={item.id} item={item} onAdd={addToCart} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Acciones rápidas */}
          {effectiveActions && !actionsUsed && msgs.length <= 1 && (
            <div className="px-3 pb-2 shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5 px-1" style={{ color: 'var(--ad-sub,#64748b)' }}>
                Acceso rápido
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-[76px] overflow-y-auto">
                {effectiveActions.map((a, i) => (
                  <button key={i} onClick={() => sendMessage(a.message)}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                    style={{ backgroundColor: 'var(--ad-accent,#f59e0b)18', color: 'var(--ad-accent,#f59e0b)', border: '1px solid var(--ad-accent,#f59e0b)33' }}>
                    {a.emoji && <span>{a.emoji}</span>}
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input + voz */}
          <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}>
            <div className="flex gap-2">
              {/* Botón de micrófono */}
              {voiceAvail && (
                <button onClick={toggleListening} disabled={busy}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all shrink-0 ${listening ? 'animate-pulse' : ''}`}
                  style={listening
                    ? { backgroundColor: '#ef4444', color: '#fff', boxShadow: '0 0 12px #ef444466' }
                    : { backgroundColor: 'var(--ad-bg,#0a0d14)', color: 'var(--ad-sub,#64748b)', border: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}>
                  🎤
                </button>
              )}
              <input ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
                placeholder={listening ? '🎤 Escuchando…' : cfg.placeholder}
                disabled={busy || listening}
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none disabled:opacity-50"
                style={{ backgroundColor: 'var(--ad-bg,#0a0d14)', color: 'var(--ad-text,#f1f5f9)', border: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}
              />
              <button onClick={() => sendMessage(input)} disabled={busy || !input.trim() || listening}
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base disabled:opacity-30 transition-all active:scale-95 shrink-0"
                style={{ background: 'var(--ad-accent,#f59e0b)', color: '#000' }}>
                ↑
              </button>
            </div>
            {voiceAvail && !listening && (
              <p className="text-[9px] text-center mt-1.5" style={{ color: 'var(--ad-sub,#64748b)' }}>
                🎤 Mantén presionado el mic para hablar
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
