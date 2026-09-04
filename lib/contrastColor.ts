// Calcula si un color de fondo necesita texto blanco o negro encima, segun
// su luminancia percibida (formula YIQ), para que el contraste nunca se
// pierda sin importar que color de marca elija cada restaurante.
export function getContrastColor(hex: string): '#000000' | '#ffffff' {
  const clean = hex.replace('#', '').trim()
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) return '#ffffff'

  const r = parseInt(full.substring(0, 2), 16)
  const g = parseInt(full.substring(2, 4), 16)
  const b = parseInt(full.substring(4, 6), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? '#000000' : '#ffffff'
}
