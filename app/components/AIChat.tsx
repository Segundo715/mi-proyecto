'use client'

import { useState, useRef, useEffect } from 'react'

type Role = 'cook' | 'staff' | 'customer' | 'admin'
interface Msg { role: 'user' | 'assistant'; content: string }

const CFG: Record<Role, { title: string; icon: string; placeholder: string; greeting: string }> = {
  cook:     { title: 'Asistente Cocina',  icon: '👨‍🍳', placeholder: '¿Qué hay preparando? ¿Receta de…?',    greeting: '¡Hola! Tengo los pedidos activos y el recetario en tiempo real. ¿Qué necesitas?' },
  staff:    { title: 'Asistente',         icon: '🤖',   placeholder: '¿Pedidos pendientes? ¿Estado…?',        greeting: '¡Hola! Puedo darte info de pedidos activos, tiempos y menú. ¿En qué te ayudo?' },
  customer: { title: 'Asistente',         icon: '💬',   placeholder: '¿Cómo va mi pedido?',                   greeting: '¡Hola! Puedo decirte el estado de tu pedido y el tiempo estimado. ¿Cuál es tu nombre?' },
  admin:    { title: 'Asistente Admin',   icon: '📊',   placeholder: 'Ventas de hoy, pedidos pendientes…',    greeting: '¡Hola! Tengo todos los datos del restaurante. ¿Qué quieres saber?' },
}

export default function AIChat({ role = 'staff' }: { role?: Role }) {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', content: CFG[role].greeting }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cfg = CFG[role]

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120) }, [open])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
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
        const snapshot = acc
        setMsgs(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: snapshot }; return u })
      }
    } catch {
      setMsgs(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: 'Error al conectar. Intenta de nuevo.' }; return u })
    }
    setBusy(false)
  }

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95"
          style={{ background: 'linear-gradient(135deg,var(--ad-accent,#f59e0b),#06b6d4)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {cfg.icon}
        </button>
      )}

      {/* Panel de chat */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col rounded-3xl shadow-2xl overflow-hidden"
          style={{ width: 340, height: 520, backgroundColor: 'var(--ad-card,#1a1d27)', border: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid var(--ad-border,rgba(255,255,255,0.08))', background: 'linear-gradient(135deg,var(--ad-accent,#f59e0b)18,#06b6d418)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{cfg.icon}</span>
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--ad-text,#f1f5f9)' }}>{cfg.title}</p>
                <p className="text-[10px]" style={{ color: 'var(--ad-accent,#f59e0b)' }}>● Datos en tiempo real</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ color: 'var(--ad-sub,#64748b)', backgroundColor: 'var(--ad-bg,#0a0d14)' }}>✕</button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[82%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words"
                  style={m.role === 'user'
                    ? { background: 'var(--ad-accent,#f59e0b)', color: '#000' }
                    : { background: 'var(--ad-bg,#0a0d14)', color: 'var(--ad-text,#f1f5f9)', border: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}>
                  {m.content || (busy && i === msgs.length - 1
                    ? <span className="inline-flex gap-1"><span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span><span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span><span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span></span>
                    : null)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}>
            <div className="flex gap-2">
              <input ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder={cfg.placeholder}
                disabled={busy}
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none disabled:opacity-50"
                style={{ backgroundColor: 'var(--ad-bg,#0a0d14)', color: 'var(--ad-text,#f1f5f9)', border: '1px solid var(--ad-border,rgba(255,255,255,0.08))' }}
              />
              <button onClick={send} disabled={busy || !input.trim()}
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
