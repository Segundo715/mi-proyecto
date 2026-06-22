'use client'

import { useState, useEffect, useRef } from 'react'

const TERMINOS = `Al registrarte aceptas que usemos tu nombre, número de WhatsApp y fecha de nacimiento únicamente para enviarte una felicitación o promoción especial en tu cumpleaños. No compartiremos tus datos con terceros. Puedes solicitar la eliminación de tus datos en cualquier momento contactándonos directamente.`
const PRIVACIDAD = `Tu información personal (nombre, teléfono y fecha de nacimiento) se almacena de forma segura y se usa exclusivamente para el programa de cumpleaños. No realizamos publicidad no solicitada ni vendemos datos personales. En cumplimiento de la legislación aplicable puedes ejercer tus derechos de acceso, rectificación y cancelación contactando al restaurante.`

function isBirthdayToday(birthdate: string): boolean {
  const [, m, d] = birthdate.split('-').map(Number)
  const now = new Date()
  return m === now.getMonth() + 1 && d === now.getDate()
}

function playManianitas() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const notes: [number, number][] = [
      [329.63,0.32],[329.63,0.32],[440,0.38],[440,0.38],[493.88,0.44],[440,0.55],[0,0.18],
      [392,0.32],[369.99,0.28],[329.63,0.32],[293.66,0.32],[329.63,0.44],[220,0.65],[0,0.18],
      [329.63,0.32],[329.63,0.32],[440,0.38],[440,0.38],[493.88,0.44],[440,0.55],[0,0.18],
      [392,0.32],[369.99,0.28],[329.63,0.32],[293.66,0.32],[329.63,0.75],
    ]
    let t = ctx.currentTime + 0.1
    for (const [freq, dur] of notes) {
      if (freq > 0) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.28, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.88)
        osc.start(t); osc.stop(t + dur)
      }
      t += dur + 0.05
    }
  } catch { /* AudioContext no disponible */ }
}

function Confetti({ count = 120 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const colors = ['#f59e0b','#ef4444','#8b5cf6','#06b6d4','#10b981','#f97316','#ec4899']
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 300,
      vx: (Math.random() - 0.5) * 5,
      vy: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: 5 + Math.random() * 9,
      h: 3 + Math.random() * 5,
      angle: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.15,
    }))
    let id: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.angle += p.va; p.vy += 0.06
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; p.vy = 2 + Math.random() * 4 }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle)
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(id)
  }, [count])
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-10" />
}

function CakeCandles({ count = 5 }: { count?: number }) {
  const positions = [42, 62, 82, 102, 122, 142].slice(0, count)
  return (
    <g>
      {positions.map((x, i) => {
        const colors = ['#ef4444','#f59e0b','#8b5cf6','#06b6d4','#10b981','#f97316']
        const h = i % 2 === 0 ? 32 : 25
        return (
          <g key={i}>
            <rect x={x - 4} y={70 - h} width={8} height={h} fill={colors[i % colors.length]} rx="3" />
            <ellipse cx={x} cy={70 - h - 7} rx="5" ry="8" fill="#fbbf24" opacity="0.9">
              <animate attributeName="ry" values="8;5;8" dur={`${0.4 + i * 0.07}s`} repeatCount="indefinite" />
              <animate attributeName="cy" values={`${70 - h - 7};${70 - h - 5};${70 - h - 7}`} dur={`${0.4 + i * 0.07}s`} repeatCount="indefinite" />
            </ellipse>
            <ellipse cx={x} cy={70 - h - 6} rx="3" ry="5" fill="#fff7ed" opacity="0.8">
              <animate attributeName="ry" values="5;3;5" dur={`${0.4 + i * 0.07}s`} repeatCount="indefinite" />
            </ellipse>
          </g>
        )
      })}
    </g>
  )
}

function AnimatedCake() {
  return (
    <div className="flex justify-center my-4">
      <svg width="200" height="200" viewBox="0 0 184 200" className="drop-shadow-2xl">
        <CakeCandles count={5} />
        {/* Capa superior */}
        <rect x="32" y="70" width="120" height="40" fill="#fce7f3" rx="10" />
        <rect x="32" y="70" width="120" height="12" fill="#f9a8d4" rx="6" />
        {/* Drips */}
        {[52, 78, 104, 130].map((x, i) => (
          <path key={i} d={`M${x},70 Q${x + 6},83 ${x + 2},90`} stroke="#f9a8d4" strokeWidth="4" fill="none" strokeLinecap="round" />
        ))}
        {/* Decoraciones capa superior */}
        {[55, 80, 105, 130].map((x, i) => (
          <circle key={i} cx={x} cy={95} r="5" fill={['#ef4444','#8b5cf6','#f59e0b','#06b6d4'][i]} />
        ))}
        {/* Capa media */}
        <rect x="18" y="110" width="148" height="44" fill="#ede9fe" rx="10" />
        <rect x="18" y="110" width="148" height="12" fill="#c4b5fd" rx="6" />
        {[38, 68, 92, 120, 148].map((x, i) => (
          <path key={i} d={`M${x},110 Q${x + 5},122 ${x + 1},128`} stroke="#c4b5fd" strokeWidth="3" fill="none" strokeLinecap="round" />
        ))}
        {/* Capa inferior */}
        <rect x="4" y="154" width="176" height="38" fill="#fef3c7" rx="10" />
        <rect x="4" y="154" width="176" height="12" fill="#fde68a" rx="6" />
        {[24, 56, 88, 120, 152].map((x, i) => (
          <path key={i} d={`M${x},154 Q${x + 6},166 ${x + 2},172`} stroke="#fde68a" strokeWidth="3" fill="none" strokeLinecap="round" />
        ))}
        {/* Plato */}
        <ellipse cx="92" cy="195" rx="90" ry="7" fill="#e2e8f0" opacity="0.7" />
      </svg>
    </div>
  )
}

function FloatingEmojis() {
  const emojis = ['🎂','🎉','🎈','⭐','🎁','✨','🎊','💫']
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {emojis.map((e, i) => (
        <div key={i} className="absolute text-2xl animate-bounce"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${2 + i * 0.4}s`,
            opacity: 0.3,
          }}>
          {e}
        </div>
      ))}
    </div>
  )
}

type Step = 'form' | 'success'

export default function CumpleanosPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<'terminos' | 'privacidad' | null>(null)
  const [isToday, setIsToday] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  async function handleSubmit() {
    if (!name.trim() || !phone.trim() || !birthdate) { setError('Por favor completa todos los campos.'); return }
    if (!accepted) { setError('Debes aceptar los términos y condiciones.'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/cumpleanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), birthdate }),
      })
      if (!res.ok) {
        const d = await res.json(); setError(d.error ?? 'Error al registrar.')
      } else {
        const today = isBirthdayToday(birthdate)
        setIsToday(today)
        setShowConfetti(true)
        setStep('success')
        if (today) setTimeout(playManianitas, 600)
      }
    } catch { setError('Error de conexión. Intenta de nuevo.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #3b0764 70%, #0f172a 100%)' }}>

      <style>{`
        @keyframes bgShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes float { 0%,100% { transform: translateY(0px) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        @keyframes popIn { 0% { opacity:0; transform: scale(0.5) rotate(-10deg); } 70% { transform: scale(1.08) rotate(2deg); } 100% { opacity:1; transform: scale(1) rotate(0); } }
        @keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        @keyframes textGlow { 0%,100% { text-shadow: 0 0 20px #f59e0b44; } 50% { text-shadow: 0 0 40px #f59e0b99, 0 0 80px #ef444466; } }
        .pop-in { animation: popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .float { animation: float 3s ease-in-out infinite; }
        .glow { animation: textGlow 2s ease-in-out infinite; }
        .shimmer { animation: shimmer 2s ease-in-out infinite; }
        input:focus { outline: none; box-shadow: 0 0 0 2px #818cf855; }
      `}</style>

      {showConfetti && <Confetti count={isToday ? 200 : 100} />}
      {step === 'form' && <FloatingEmojis />}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-white">
              {modal === 'terminos' ? 'Términos y Condiciones' : 'Política de Privacidad'}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
              {modal === 'terminos' ? TERMINOS : PRIVACIDAD}
            </p>
            <button onClick={() => setModal(null)} className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}>
              Entendido
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative z-20">
        {step === 'form' ? (
          <div className="rounded-3xl overflow-hidden shadow-2xl fade-up"
            style={{ backgroundColor: 'rgba(15,23,42,0.92)', border: '1px solid rgba(129,140,248,0.2)', backdropFilter: 'blur(12px)' }}>

            {/* Header */}
            <div className="text-center p-8 pb-6 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' }}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #ec4899 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 50%)' }} />
              <div className="text-6xl mb-3 float relative">🎂</div>
              <h1 className="text-2xl font-black text-white relative">Club de Cumpleaños</h1>
              <p className="text-sm mt-1 relative" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Regístrate y recibe una sorpresa especial en tu día
              </p>
            </div>

            {/* Form */}
            <form onSubmit={e => { e.preventDefault(); handleSubmit() }} className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm fade-up"
                  style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  {error}
                </div>
              )}

              {[
                { label: 'Nombre completo', type: 'text', value: name, onChange: setName, placeholder: 'Tu nombre' },
                { label: 'WhatsApp', type: 'tel', value: phone, onChange: setPhone, placeholder: '10 dígitos' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#818cf8' }}>
                    {f.label}
                  </label>
                  <input type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl px-4 py-3 text-sm transition-all"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#f1f5f9', border: '1px solid rgba(129,140,248,0.25)' }} />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#818cf8' }}>
                  Fecha de nacimiento
                </label>
                <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm transition-all"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#f1f5f9', border: '1px solid rgba(129,140,248,0.25)', colorScheme: 'dark' }} />
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input type="checkbox" id="terms" checked={accepted} onChange={e => setAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 shrink-0" style={{ accentColor: '#818cf8' }} />
                <label htmlFor="terms" className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                  Acepto los{' '}
                  <button type="button" onClick={() => setModal('terminos')} className="underline font-bold" style={{ color: '#a5b4fc' }}>
                    Términos y Condiciones
                  </button>{' '}y la{' '}
                  <button type="button" onClick={() => setModal('privacidad')} className="underline font-bold" style={{ color: '#a5b4fc' }}>
                    Política de Privacidad
                  </button>
                </label>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-black text-sm disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)', color: '#fff', boxShadow: '0 4px 24px rgba(99,102,241,0.4)' }}>
                {loading ? '✨ Registrando...' : '🎉 ¡Regístrame!'}
              </button>
            </form>
          </div>

        ) : isToday ? (
          /* ===== PANTALLA CUMPLEAÑOS HOY ===== */
          <div className="text-center space-y-2">
            <div className="pop-in">
              <div className="rounded-3xl overflow-hidden shadow-2xl"
                style={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '2px solid rgba(245,158,11,0.4)', backdropFilter: 'blur(12px)' }}>
                <div className="p-6 pb-2" style={{ background: 'linear-gradient(135deg,#78350f,#92400e,#b45309)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#fde68a' }}>¡Hoy es tu día!</p>
                  <h2 className="text-3xl font-black text-white glow">🎂 Feliz Cumpleaños</h2>
                  <p className="font-black text-xl mt-1" style={{ color: '#fde68a' }}>{name} 🎉</p>
                </div>
                <div className="px-4">
                  <AnimatedCake />
                </div>
                <div className="px-6 pb-6 space-y-3">
                  <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                    ¡Qué coincidencia tan especial! Hoy es tu cumpleaños y acabas de unirte a nuestro club. 🥳 Comunícate con nosotros para reclamar tu regalo.
                  </p>
                  <button onClick={playManianitas}
                    className="w-full py-3 rounded-xl font-bold text-sm shimmer"
                    style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }}>
                    🎵 Escuchar las Mañanitas
                  </button>
                </div>
              </div>
            </div>
          </div>

        ) : (
          /* ===== PANTALLA ÉXITO NORMAL ===== */
          <div className="rounded-3xl overflow-hidden shadow-2xl pop-in"
            style={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(129,140,248,0.2)', backdropFilter: 'blur(12px)' }}>
            <div className="p-8 text-center"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <div className="text-6xl mb-3 float">🎉</div>
              <h2 className="text-2xl font-black text-white">¡Ya eres parte del club!</h2>
            </div>
            <div className="p-8 space-y-3 text-center">
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                Hola <strong style={{ color: '#f1f5f9' }}>{name}</strong>, te avisaremos por WhatsApp cuando llegue tu día especial con una sorpresa de nuestra parte. 🎂
              </p>
              <p className="text-xs" style={{ color: '#475569' }}>Puedes cerrar esta página.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
