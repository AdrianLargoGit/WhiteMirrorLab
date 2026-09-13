'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import PaintHedgehog from '@/components/PaintHedgehog'
import { heroCopy } from '@/lib/copy'
import { downloadPath, type Locale } from '@/lib/i18n'
import { BUY_ME_A_COFFEE_URL } from '@/lib/links'
import { BREVO_COUNT_FALLBACK, fetchBrevoCount } from '@/lib/brevo-count'
import styles from './Hero.module.css'

interface HeroProps {
  lang: Locale
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

export default function Hero({ lang }: HeroProps) {
  const t = heroCopy[lang]
  const statsRef = useRef<HTMLDivElement>(null)
  const participantsRef = useRef<HTMLSpanElement>(null)
  const experimentsRef = useRef<HTMLSpanElement>(null)
  
  const [totalParticipants, setTotalParticipants] = useState<number>(BREVO_COUNT_FALLBACK)

  useEffect(() => {
    let isMounted = true

    async function fetchParticipantsCount() {
      const count = await fetchBrevoCount('general')
      if (isMounted) {
        setTotalParticipants(count)
      }
    }

    fetchParticipantsCount()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!statsRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (participantsRef.current) {
              animateCounter(participantsRef.current, totalParticipants, '')
            }
            if (experimentsRef.current) {
              animateCounter(experimentsRef.current, 1, '')
            }
            // No hacemos disconnect() aquí para que sea más flexible
          }
        })
      },
      { threshold: 0.5 }
    )
    
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [totalParticipants]) // Añadido como dependencia

  return (
    <section className={styles.hero}>
      <div className={styles.heroBgGrid} aria-hidden="true" />
      <div className={styles.heroScanLine} aria-hidden="true" />
      <div className={`${styles.paintHero} ${styles.animate5}`}>
        <PaintHedgehog />
      </div>

      <p className={`${styles.heroTag} ${styles.animate1}`}>
        {t.tag}
      </p>

      <h1 className={`${styles.heroTitle} ${styles.animate2}`}>
        <span>{t.line1}</span>
        <span className={styles.outline}>{t.line2}</span>
        <span className={t.line3accent === 'X.X.0' ? styles.versionLine : undefined}>
          {t.line3pre}{' '}
          <span className={styles.accentWord}>{t.line3accent}</span>
        </span>
        <span className={styles.outline}>{t.line4}</span>
      </h1>

      <p className={`${styles.heroDesc} ${styles.animate3}`}>
        {t.desc}
      </p>

      <div className={`${styles.heroActions} ${styles.animate4}`}>
        <Link
  href={downloadPath(lang)}
  className="btn-primary"
>
  <span>{t.ctaPrimary}</span>
</Link>
        <a href={BUY_ME_A_COFFEE_URL} className="btn-ghost" target="_blank" rel="noopener noreferrer">
          <span className="btn-ghost-arrow" aria-hidden="true" />
          <span>{t.ctaGhost}</span>
        </a>
      </div>

      <div
        className={`${styles.heroStats} ${styles.animate5}`}
        ref={statsRef}
      >
        <div className={styles.heroStatItem}>
          <span ref={participantsRef} className={styles.heroStatNum}>
            0
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
