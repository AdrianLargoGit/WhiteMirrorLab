'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { heroCopy } from '@/lib/copy'
import { localizedHashPath, type Locale } from '@/lib/i18n'
import { createClient } from '@/lib/supabase'
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
  const counterFiredRef = useRef(false)
  
  const [totalParticipants, setTotalParticipants] = useState<number>(0)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfilesCount() {
      const { data, error } = await supabase.rpc('get_total_profiles')
      if (!error && data !== null) {
        setTotalParticipants(data)
      }
    }
    fetchProfilesCount()
  }, [supabase])

  useEffect(() => {
    counterFiredRef.current = false
  }, [lang])

  useEffect(() => {
    // Si aún no tenemos datos, no hacemos nada
    if (totalParticipants === 0 || !statsRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animamos directamente con el valor que ya trajo Supabase
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

      <p className={`${styles.heroTag} ${styles.animate1}`}>
        {t.tag}
      </p>

      <h1 className={`${styles.heroTitle} ${styles.animate2}`}>
        <span>{t.line1}</span>
        <span className={styles.outline}>{t.line2}</span>
        <span>
          {t.line3pre}{' '}
          <span className={styles.accentWord}>{t.line3accent}</span>
        </span>
        <span className={styles.outline}>{t.line4}</span>
      </h1>

      <p className={`${styles.heroDesc} ${styles.animate3}`}>
        {t.desc}
      </p>

      <div className={`${styles.heroActions} ${styles.animate4}`}>
        <Link href={localizedHashPath(lang, '#experiments')} className="btn-primary">
          <span>{t.ctaPrimary}</span>
        </Link>
        <Link href={localizedHashPath(lang, '#manifesto')} className="btn-ghost">
          <span className="btn-ghost-arrow" aria-hidden="true" />
          <span>{t.ctaGhost}</span>
        </Link>
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