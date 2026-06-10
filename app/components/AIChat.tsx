'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export type AIRole = 'cook' | 'staff' | 'customer' | 'admin' | 'recipe'
interface Msg { role: 'user' | 'assistant'; content: string }
export interface QuickAction { label: string; message: string; emoji?: string }

const CFG: Record<AIRole, { title: string; icon: string; placeholder: string; greeting: string }> = {
  cook:     { title: 'Asistente Cocina',   icon: '👨‍🍳', placeholder: '¿Qué hay preparando? ¿Pasos de una receta?…',  greeting: '¡Hola! Tengo los pedidos y el recetario en tiempo real. ¿Quieres que te lea los pasos de alguna receta?' },
  staff:    { title: 'Asistente',          icon: '🤖',   placeholder: '¿Pedidos pendientes? ¿Estado de mesa?…',        greeting: '¡Hola! Puedo consultarte pedidos activos, tiempos y menú. ¿En qué te ayudo?' },
  customer: { title: 'Asistente',          icon: '💬',   placeholder: '¿Cómo va mi pedido? ¿Qué me recomiendas?',      greeting: '¡Hola! Puedo decirte el estado de tu pedido, el tiempo estimado o recomendarte algo del menú. ¿En qué te ayudo?' },
  admin:    { title: 'Asistente Admin',    icon: '📊',   placeholder: 'Ventas de hoy, pedidos pendientes, tendencias…', greeting: '¡Hola! Tengo todos los datos del restaurante en tiempo real. ¿Qué quieres saber?' },
  recipe:   { title: 'Chef IA',            icon: '📖',   placeholder: '¿Cómo se prepara…? ¿Puedo sustituir…?',         greeting: '¡Hola! Soy tu chef virtual. Puedo explicarte recetas paso a paso, sugerirte variaciones o responder dudas de cocina. ¿En qué te ayudo?' },
}

function getRoleFromPath(path: string): AIRole {
  if (path.includes('/resta3/cocina')) return 'cook'
  if (path.includes('/resta3'))        return 'staff'
  if (path.includes('/admin'))         return 'admin'
  if (path.includes('/reseta') || path.includes('/receta')) return 'recipe'
  return 'customer'
}

export default function AIChat({
  role: roleProp,
  quickActions,
  initialMessage,
  position = 'bottom-right',
}: {
  role?: AIRole
  quickActions?: QuickAction[]
  initialMessage?: string
  position?: 'bottom-right' | 'bottom-left'
}) {
  const pathname = usePathname()
  const role = roleProp ?? getRoleFromPath(pathname)
  const cfg = CFG[role]

  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', content: cfg.greeting }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionsUsed, setActionsUsed] = useState(false)
  const [autoActions, setAutoActions] = useState<QuickAction[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cuando el rol es cocinero, carga las recetas automáticamente como acciones rápidas
  useEffect(() => {
    if (role === 'cook') {
      fetch('/api/recipes')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAutoActions(data.map((r: { name: string }) => ({
              emoji: '📖',
              label: r.name,
              message: `Explícame cómo preparar "${r.name}" paso a paso. Dame los ingredientes primero y luego los pasos numerados.`,
            })))
          }
        })
        .catch(() => {})
    }
  }, [role])

  const effectiveActions = quickActions ?? (role === 'cook' && autoActions.length > 0 ? autoActions : undefined)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  useEffect(() => {
    if (open && initialMessage && msgs.length === 1) {
      sendMessage(initialMessage)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function sendMessage(text: string) {
    if (!text.trim() || busy) return
    setInput('')
    setActionsUsed(true)
    const history: Msg[] = [...msgs, { role: 'user', content: text }]
    setMsgs([...history, { role: 'assistant', content: '' }])
    setBusy(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, role }),
      })
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += dec.decode(value, { stream: true })
        const snap = acc
        setMsgs(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: snap }; return u })
      }
    } catch {
      setMsgs(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: 'Error al conectar. Intenta de nuevo.' }; return u })
    }
    setBusy(false)
  }

  const posClass = position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6'

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
          style={{ width: 340, height: 540, backgroundColor: 'var(--ad-card,#1a1d27)', border: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid var(--ad-border,rgba(255,255,255,0.08))', background: 'linear-gradient(135deg,var(--ad-accent,#f59e0b)18,#06b6d418)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{cfg.icon}</span>
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--ad-text,#f1f5f9)' }}>{cfg.title}</p>
                <p className="text-[10px]" style={{ color: 'var(--ad-accent,#f59e0b)' }}>● Datos en tiempo real · Groq Llama 3</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setMsgs([{ role: 'assistant', content: cfg.greeting }]); setActionsUsed(false) }}
                className="text-[10px] px-2 py-1 rounded-lg" style={{ color: 'var(--ad-sub,#64748b)', backgroundColor: 'var(--ad-bg,#0a0d14)' }}>
                ↺ Nueva
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                style={{ color: 'var(--ad-sub,#64748b)', backgroundColor: 'var(--ad-bg,#0a0d14)' }}>✕</button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words leading-relaxed"
                  style={m.role === 'user'
                    ? { background: 'var(--ad-accent,#f59e0b)', color: '#000' }
                    : { background: 'var(--ad-bg,#0a0d14)', color: 'var(--ad-text,#f1f5f9)', border: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}>
                  {m.content || (busy && i === msgs.length - 1
                    ? <span className="inline-flex gap-1 opacity-60">
                        {['0ms','150ms','300ms'].map((d,j) => <span key={j} className="animate-bounce" style={{ animationDelay: d }}>●</span>)}
                      </span>
                    : null)}
                </div>
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
              <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                {effectiveActions!.map((a, i) => (
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

          {/* Input */}
          <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}>
            <div className="flex gap-2">
              <input ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
                placeholder={cfg.placeholder}
                disabled={busy}
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none disabled:opacity-50"
                style={{ backgroundColor: 'var(--ad-bg,#0a0d14)', color: 'var(--ad-text,#f1f5f9)', border: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}
              />
              <button onClick={() => sendMessage(input)} disabled={busy || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base disabled:opacity-30 transition-all active:scale-95"
                style={{ background: 'var(--ad-accent,#f59e0b)', color: '#000' }}>
                ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
