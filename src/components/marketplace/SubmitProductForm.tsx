'use client'

import Link from 'next/link'
import { marketplaceAvailabilityCopy } from '@/lib/marketplaceAvailability'
import { skinTemplatePath, type Locale } from '@/lib/i18n'
import styles from './SubmitProductForm.module.css'

type SubmitProductFormProps = {
  lang: Locale
}

export function SubmitProductForm({ lang }: SubmitProductFormProps) {
  const t = marketplaceAvailabilityCopy[lang]

  return (
    <section className={styles.closedPanel} aria-labelledby="marketplace-submit-closed-title">
      <span>{t.short}</span>
      <h2 id="marketplace-submit-closed-title">{t.submitTitle}</h2>
      <p>{t.submitBody}</p>
      <Link href={skinTemplatePath(lang)}>{t.prepareCta}</Link>
    </section>
  )
}
