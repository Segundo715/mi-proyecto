const BUSINESS_PHONE = '5214471078185'

export async function notifyWhatsApp(message: string): Promise<void> {
  const apiKey = process.env.CALLMEBOT_API_KEY
  if (!apiKey) return
  try {
    await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${BUSINESS_PHONE}&text=${encodeURIComponent(message)}&apikey=${apiKey}`,
      { method: 'GET' }
    )
  } catch {}
}
