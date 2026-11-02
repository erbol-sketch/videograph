'use client'
import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site, portfolio, type Category } from '../lib/site'

/** Scroll effects for every .fx-* element on the page. */
export function Reveal() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const on = (sel: string, from: gsap.TweenVars, to: gsap.TweenVars) =>
        gsap.utils.toArray<HTMLElement>(sel).forEach((el) =>
          gsap.fromTo(el, from, { ...to, scrollTrigger: { trigger: el, start: 'top 88%' } }))
      on('.fx-up', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' })
      on('.fx-mask', { clipPath: 'inset(0 0 100% 0)', y: 40 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.2, ease: 'power4.out' })
      on('.fx-rule', { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'power3.inOut' })
      on('.fx-stamp', { scale: 2.6, rotation: -16, opacity: 0 }, { scale: 1, rotation: -6, opacity: 1, duration: 0.5, ease: 'back.out(2.4)' })
      gsap.utils.toArray<HTMLElement>('.fx-par').forEach((el) =>
        gsap.to(el, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: el, scrub: true } }))
    })
    return () => ctx.revert()
  }, [])
  return null
}

/** Scrolling "EXTRA! EXTRA!" strip. */
export function Ticker() {
  const text = ['Extra! Extra!', ...site.services.map((s) => s.title), 'Read all about it'].join('  ✦  ')
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker-track">
        {[0, 1].map((i) => <span key={i}>{text}  ✦  {text}  ✦  </span>)}
      </div>
    </div>
  )
}

const Head = ({ n, label, title }: { n: string; label: string; title: string }) => (
  <header className="head">
    <div className="kick"><span>Section {n}</span><span>{label}</span><span>Vol. I</span></div>
    <i className="rule fx-rule" />
    <h2 className="fx-mask">{title}</h2>
  </header>
)

export function About() {
  const { about } = site
  return (
    <section id="about" className="sec paper">
      <div className="wrap">
        <Head n="A" label="Profile" title={about.title} />
        <div className="about-grid">
          <figure className="fx-up">
            <div className="portrait">
              <div className="fx-par">
                {about.portrait ? <img src={about.portrait} alt={site.name} /> : <span>Portrait<br />placeholder</span>}
              </div>
            </div>
            <figcaption>Fig. 1 — {site.name}, {site.role}</figcaption>
          </figure>
          <div>
            <p className="byline fx-up">By {site.name}, Staff Photographer</p>
            <div className="cols">
              {about.body.map((t, i) => <p className="fx-up" key={i}>{t}</p>)}
            </div>
            <p className="sign fx-up">— {site.name}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Portfolio() {
  const cats = Object.keys(portfolio) as Category[]
  const [cat, setCat] = useState<Category>('Portraits')
  const box = useRef<HTMLDivElement>(null)

  // photos "develop" out of the darkroom each time a tab opens
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo('.plate',
        { y: 70, opacity: 0, rotation: () => gsap.utils.random(-5, 5), filter: 'grayscale(1) sepia(1) brightness(.3)' },
        { y: 0, opacity: 1, rotation: 0, filter: 'grayscale(0) sepia(0) brightness(1)', duration: 1.2, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: box.current, start: 'top 85%' } })
    }, box)
    return () => ctx.revert()
  }, [cat])

  return (
    <section id="portfolio" className="sec paper2">
      <div className="wrap">
        <Head n="B" label="Photo Gallery" title="Selected work" />
        <div className="tabs fx-up" role="tablist">
          {cats.map((c) => (
            <button key={c} role="tab" aria-selected={c === cat} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div ref={box} className={`grid ${cat === 'Reels' ? 'reels' : ''}`} key={cat}>
          {portfolio[cat].map((w, i) => (
            <figure className="plate" key={i}>
              <div className="frame">
                {w.src ? (w.kind === 'video'
                  ? <video src={w.src} muted loop playsInline autoPlay preload="metadata" />
                  : <img src={w.src} alt={w.alt ?? `${cat} ${i + 1}`} loading="lazy" />)
                  : <div className="ph"><b>№ {String(i + 1).padStart(2, '0')}</b><span>{cat === 'Reels' ? 'Your reel' : 'Your photograph'}</span></div>}
              </div>
              <figcaption>Plate {String(i + 1).padStart(2, '0')} — {cat}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Services() {
  return (
    <section id="services" className="sec paper">
      <div className="wrap">
        <Head n="C" label="Classifieds" title="What I shoot" />
        <div className="ads">
          {site.services.map((s, i) => (
            <article className="ad fx-up" key={s.title}>
              <small>Offered · № {String(i + 1).padStart(2, '0')}</small>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Booking() {
  const [state, setState] = useState<{ s: 'idle' | 'sending' | 'ok' | 'err'; msg?: string }>({ s: 'idle' })
  const today = new Date().toISOString().slice(0, 10)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setState({ s: 'sending' })
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'Something went wrong.')
      setState({ s: 'ok' })
      form.reset()
    } catch (err) {
      setState({ s: 'err', msg: (err as Error).message })
    }
  }

  return (
    <section id="booking" className="sec paper2">
      <div className="wrap">
        <Head n="D" label="Reservations" title="Reserve your session" />
        <form onSubmit={submit} className="form fx-up">
          <div className="form-top"><b>WANTED:</b> one unforgettable day. <b>Apply within.</b></div>
          <label>Name<input name="name" required autoComplete="name" /></label>
          <label>Phone<input name="phone" type="tel" required autoComplete="tel" /></label>
          <label className="full">Service
            <select name="service" required defaultValue="">
              <option value="" disabled>Choose a service</option>
              {site.services.map((s) => <option key={s.title}>{s.title}</option>)}
            </select>
          </label>
          <label>Date<input name="date" type="date" min={today} required /></label>
          <label>Time<input name="time" type="time" required /></label>
          <label className="full">Message<textarea name="message" rows={4} /></label>
          <button className="btn full" disabled={state.s === 'sending'}>{state.s === 'sending' ? 'Sending…' : 'Submit request'}</button>
          <p className={`status full ${state.s}`} role="status">{state.s === 'err' && state.msg}</p>
          {state.s === 'ok' && <div className="stamp">Received</div>}
        </form>
      </div>
    </section>
  )
}

export function Contact() {
  const c = site.contact
  const items = [
    ['Instagram', c.instagram, c.instagram, '@your_instagram'],
    ['Telegram', c.telegram, c.telegram, '@your_telegram'],
    ['WhatsApp', c.whatsapp, c.whatsapp, '+000 00 000 00 00'],
    ['Email', c.email, c.email && `mailto:${c.email}`, 'hello@yourdomain.com'],
  ]
  return (
    <section id="contact" className="sec ink">
      <div className="wrap">
        <Head n="E" label="Correspondence" title="Letters to the editor" />
        <ul className="contact">
          {items.map(([k, val, href, ph]) => (
            <li className="fx-up" key={k}>
              <small>{k}</small>
              {href ? <a href={href} target="_blank" rel="noreferrer">{val}</a> : <span className="muted">{ph}</span>}
            </li>
          ))}
        </ul>
        <p className="foot">© {new Date().getFullYear()} {site.name} · All rights reserved · Printed in light</p>
      </div>
    </section>
  )
}