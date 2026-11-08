import { NextResponse } from 'next/server'

// Delivers booking requests to your Telegram. Set in .env.local:
//   TELEGRAM_BOT_TOKEN=...   TELEGRAM_CHAT_ID=...
export async function POST(req: Request) {
  const b = await req.json().catch(() => null)
  const need = ['name', 'phone', 'service', 'date', 'time']
  if (!b || need.some((k) => !String(b[k] ?? '').trim()))
    return NextResponse.json({ error: 'Заполните все обязательные поля.' }, { status: 400 })
  const c = (k: string, n = 600) => String(b[k] ?? '').slice(0, n)
  const text = `📷 Новая заявка\nИмя: ${c('name', 100)}\nТелефон: ${c('phone', 40)}\nУслуга: ${c('service', 80)}\nКогда: ${c('date', 20)} ${c('time', 10)}\nСообщение: ${c('message') || '—'}`
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID
  if (!token || !chat) {
    console.log(text)
    return NextResponse.json({ error: 'Отправка заявок пока не настроена. Свяжитесь через контакты ниже.' }, { status: 503 })
  }
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text }),
  })
  if (!r.ok) return NextResponse.json({ error: 'Не удалось отправить заявку. Попробуйте ещё раз.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
