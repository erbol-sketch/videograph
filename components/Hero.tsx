'use client'
import dynamic from 'next/dynamic'
import { useLayoutEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '../lib/site'
import type { Progress } from './CameraScene'

const CameraScene = dynamic(() => import('./CameraScene'), { ssr: false })

const CHAPTERS = [
  ['I', 'Съёмка', 'Любая задача — на телефон, без лишнего оборудования.'],
  ['II', 'Кадр', 'Свет, композиция и звук решают больше, чем цена камеры.'],
  ['III', 'Монтаж', 'Ритм и цвет превращают материал в историю.'],
]

function Loader() {
  const { progress } = useProgress()
  return (
    <div className="loader" style={{ opacity: progress >= 100 ? 0 : 1 }} aria-hidden>
      <span>{Math.round(progress)}%</span>
    </div>
  )
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef<Progress>({ current: 0 }).current
  const [mobile, setMobile] = useState(false)
  const [active, setActive] = useState(true)

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.config({ ignoreMobileResize: true })
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    setMobile(isMobile)
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: isMobile ? '+=600%' : '+=900%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          onToggle: (s) => setActive(s.isActive || s.progress === 0),
        },
      })
      tl.to(progress, { current: 1, duration: 1 }, 0) // drives the 3D camera
      tl.to('.h-title', { opacity: 0, y: -70, duration: 0.09 }, 0.04)
      tl.to('.h-hint', { opacity: 0, duration: 0.04 }, 0.01)
      gsap.utils.toArray<HTMLElement>('.chap').forEach((el, i) => {
        const a = 0.17 + i * 0.2
        tl.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.05 }, a).to(
          el,
          { opacity: 0, y: -30, duration: 0.05 },
          a + 0.12
        )
      })
      tl.fromTo('.vf', { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.1 }, 0.8)
      // light floods in through the eyepiece and becomes the About section.
      // Start at -20% so the mask is fully transparent (no glow in the middle).
      tl.fromTo('.iris', { '--r': '-20%' }, { '--r': '150%', ease: 'power2.in', duration: 0.1 }, 0.9)
    }, root)
    return () => ctx.revert()
  }, [progress])

  return (
    <section id="home" ref={root} className="hero">
      <div className="hero-canvas">
        <CameraScene progress={progress} mobile={mobile} active={active} />
      </div>
      <Loader />
      <div className="hero-vignette" />
      <div className="vf" aria-hidden />
      <div className="hero-copy">
        <p className="eyebrow h-title">{site.role}</p>
        <h1 className="h-title">
          {site.headline.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </h1>
      </div>
      {CHAPTERS.map(([n, t, d]) => (
        <div className="chap" key={n}>
          <small>{n}</small>
          <h2>{t}</h2>
          <p>{d}</p>
        </div>
      ))}
      <div className="h-hint">
        <span>Листай</span>
        <i />
      </div>
      <div className="iris" aria-hidden />
    </section>
  )
}