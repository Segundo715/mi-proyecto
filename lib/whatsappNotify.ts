const BUSINESS_PHONE = '5214471078185'

export async function notifyWhatsApp(message: string): Promise<void> {
  const apiKey = process.env.CALLMEBOT_API_KEY
  if (!apiKey) {
    console.warn('[WhatsApp] CALLMEBOT_API_KEY no configurada — notificación omitida')
    return
  }
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${BUSINESS_PHONE}&text=${encodeURIComponent(message)}&apikey=${apiKey}`
    const res = await fetch(url, { method: 'GET' })
    const body = await res.text()
    if (!res.ok || body.toLowerCase().includes('error')) {
      console.error('[WhatsApp] CallMeBot error:', res.status, body)
    } else {
      console.log('[WhatsApp] Notificación enviada OK')
    }
  } catch (e) {
    console.error('[WhatsApp] fetch falló:', e)
  }
}
