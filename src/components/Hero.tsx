'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './Hero.module.css'

interface HeroProps {
  lang?: 'es' | 'en'
}

const copy = {
  es: {
    tag: 'Laboratorio de Experimentación Social',
    line1: '¿Qué hace',
    line2: 'el ser humano',
    line3pre: 'cuando',
    line3accent: 'nadie',
    line4: 'lo observa?',
    desc: 'Diseñamos aplicaciones que empujan los límites del comportamiento colectivo. Experimentos sociales controlados, éticos y temporales que revelan las verdades incómodas de nuestra naturaleza digital.',
    ctaPrimary: 'Ver Experimentos',
    ctaGhost: 'Nuestro Manifiesto',
    statParticipants: 'Participantes',
    statExperiments: 'Experimentos',
    statOptin: 'Opt-in',
  },
  en: {
    tag: 'Social Experimentation Lab',
    line1: 'What does',
    line2: 'the human being',
    line3pre: 'do when',
    line3accent: 'nobody',
    line4: 'is watching?',
    desc: 'We design applications that push the limits of collective behaviour. Controlled, ethical, time-limited social experiments that reveal uncomfortable truths about our digital nature.',
    ctaPrimary: 'See Experiments',
    ctaGhost: 'Our Manifesto',
    statParticipants: 'Participants',
    statExperiments: 'Experiments',
    statOptin: 'Opt-in',
  },
}

function animateCounter(el: HTMLElement, target: number, suffix: string) {
  const duration = 1200
  let start: number | null = null
  const step = (ts: number) => {
    if (!start) start = ts
    const progress = Math.min((ts - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    el.textContent = Math.round(eased * target) + suffix
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export default function Hero({ lang = 'es' }: HeroProps) {
  const t = copy[lang]
  // mounted guards SSR — keeps opacity:0 off until client hydrates
  const [mounted, setMounted] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const participantsRef = useRef<HTMLSpanElement>(null)
  const experimentsRef = useRef<HTMLSpanElement>(null)
  const counterFiredRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Re-run counter whenever lang changes (resets the fired guard)
  useEffect(() => {
    counterFiredRef.current = false
  }, [lang])

  useEffect(() => {
    if (!statsRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !counterFiredRef.current) {
            counterFiredRef.current = true
            if (participantsRef.current) animateCounter(participantsRef.current, 0, '')
            if (experimentsRef.current) animateCounter(experimentsRef.current, 1, '')
            observer.disconnect()
          }
        })
      },
      { threshold: 0.5 }
    )
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className={styles.hero}>
      {/* Background grid */}
      <div className={styles.heroBgGrid} aria-hidden="true" />

      {/* Animated scan line */}
      <div className={styles.heroScanLine} aria-hidden="true" />

      {/* Tag — mounted class triggers animation, avoids SSR opacity:0 flash */}
      <p className={`${styles.heroTag} ${mounted ? styles.animate1 : ''}`}>
        {t.tag}
      </p>

      {/* Title */}
      <h1 className={`${styles.heroTitle} ${mounted ? styles.animate2 : ''}`}>
        <span>{t.line1}</span>
        <span className={styles.outline}>{t.line2}</span>
        <span>
          {t.line3pre}{' '}
          <span className={styles.accentWord}>{t.line3accent}</span>
        </span>
        <span className={styles.outline}>{t.line4}</span>
      </h1>

      {/* Description */}
      <p className={`${styles.heroDesc} ${mounted ? styles.animate3 : ''}`}>
        {t.desc}
      </p>

      {/* CTA buttons */}
      <div className={`${styles.heroActions} ${mounted ? styles.animate4 : ''}`}>
        <Link href="#experiments" className="btn-primary">
          <span>{t.ctaPrimary}</span>
        </Link>
        <Link href="#manifesto" className="btn-ghost">
          <span className="btn-ghost-arrow" aria-hidden="true" />
          <span>{t.ctaGhost}</span>
        </Link>
      </div>

      {/* Stats */}
      <div
        className={`${styles.heroStats} ${mounted ? styles.animate5 : ''}`}
        ref={statsRef}
      >
        <div className={styles.heroStatItem}>
          <span ref={participantsRef} className={styles.heroStatNum}>
            117
          </span>
          <span className={styles.heroStatLabel}>{t.statParticipants}</span>
        </div>
        <div className={styles.heroStatItem}>
          <span ref={experimentsRef} className={styles.heroStatNum}>
            0
          </span>
          <span className={styles.heroStatLabel}>{t.statExperiments}</span>
        </div>
        <div className={styles.heroStatItem}>
          <span className={styles.heroStatNum}>100%</span>
          <span className={styles.heroStatLabel}>{t.statOptin}</span>
        </div>
      </div>
    </section>
  )
}