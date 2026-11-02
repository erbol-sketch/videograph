import { NextResponse } from 'next/server'

// Delivers booking requests to your Telegram. Set in .env.local:
//   TELEGRAM_BOT_TOKEN=...   TELEGRAM_CHAT_ID=...
export async function POST(req: Request) {
  const b = await req.json().catch(() => null)
  const need = ['name', 'phone', 'service', 'date', 'time']
  if (!b || need.some((k) => !String(b[k] ?? '').trim()))
    return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
  const c = (k: string, n = 600) => String(b[k] ?? '').slice(0, n)
  const text = `📷 New booking request\nName: ${c('name', 100)}\nPhone: ${c('phone', 40)}\nService: ${c('service', 80)}\nWhen: ${c('date', 20)} ${c('time', 10)}\nMessage: ${c('message') || '—'}`
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID
  if (!token || !chat) {
    console.log(text)
    return NextResponse.json({ error: 'Booking delivery is not configured yet. Please use the contact details below.' }, { status: 503 })
  }
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text }),
  })
  if (!r.ok) return NextResponse.json({ error: 'Could not deliver your request. Please try again.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
