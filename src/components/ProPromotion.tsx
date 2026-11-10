'use client'

import { proPromotionCopy } from '@/lib/proPromotion'
import { proCopy } from '@/lib/proCopy'
import { downloadPath, type Locale } from '@/lib/i18n'
import type { ProBillingPlan } from '@/lib/proConfig'
import styles from './ProPromotion.module.css'

export default function ProPromotion({ lang, remaining, plan, variant = 'download' }: {
  lang: Locale; remaining: number; plan?: ProBillingPlan; variant?: 'home' | 'download'
}) {
  if (remaining <= 0) return null
  const t = proPromotionCopy[lang]
  const price = plan ? proCopy[lang][plan] : `${proCopy[lang].monthly} · ${proCopy[lang].annual}`
  const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60]
  return (
    <a href={downloadPath(lang)} className={`${styles.offer} ${styles[variant]}`} aria-label={`${t.headline}. ${lang === 'es' ? 'Ir a la página de descarga' : 'Go to the download page'}`}>
      <div className={styles.message}>
        <p className={styles.headline}>{t.headline}</p>
        <div className={styles.prices}><s>{price}</s><strong>{t.free}</strong></div>
        <p className={styles.conditions}>{t.shortTerms}</p>
      </div>
      <div className={styles.clock}>
        <div role="timer" aria-label={t.remaining} className={styles.digits} aria-live="off">
          {values.map((value, index) => <span className={styles.unit} key={t.units[index]}><b>{String(value).padStart(2, '0')}</b><small>{t.units[index]}</small></span>)}
        </div>
        <small className={styles.deadline}>{t.deadline}</small>
      </div>
    </a>
  )
}
