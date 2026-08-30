import { headers } from 'next/headers'
import CustomCursor from '@/components/CustomCursor'
import Navbar from '@/components/Navbar'
import { SubmitProductForm } from '@/components/marketplace/SubmitProductForm'
import { DEFAULT_LOCALE, isLocale, skinTemplatePath, type Locale } from '@/lib/i18n'
import { marketplaceAvailabilityCopy } from '@/lib/marketplaceAvailability'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata = {
  title: 'Submit Product | White Mirror Lab',
}

const copy = {
  es: {
    eyebrow: 'Marketplace de skins',
    title: 'Sube tu skin para revision',
    lead:
      'Completa el formulario oficial para enviar tu ZIP, portada y previews. Revisaremos el pack antes de publicarlo.',
    backToKit: 'Volver al kit',
    privacy: 'Blob privado',
    review: 'Revision manual',
    publish: 'Checkout',
    checklistTitle: 'Antes de enviar',
    checklist: [
      'Incluye todos los assets dentro del ZIP.',
      'Usa nombres claros para carpetas y archivos.',
      'Comprueba que el precio supera el minimo para cubrir comisiones de Stripe y plataforma.',
    ],
  },
  en: {
    eyebrow: 'Skin marketplace',
    title: 'Submit your skin for review',
    lead:
      'Complete the official form to send your ZIP, cover, and previews. We will review the pack before publishing it.',
    backToKit: 'Back to kit',
    privacy: 'Private Blob',
    review: 'Manual review',
    publish: 'Checkout',
    checklistTitle: 'Before sending',
    checklist: [
      'Include every asset inside the ZIP.',
      'Use clear folder and file names.',
      'Check the price clears the minimum for Stripe and platform fees.',
    ],
  },
} satisfies Record<Locale, Record<string, string | string[]>>

export default async function SubmitProductPage() {
  const headerLocale = (await headers()).get('x-wml-locale')
  const lang: Locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE
  const t = copy[lang]
  const availability = marketplaceAvailabilityCopy[lang]

  return (
    <div className="landing-page">
      <CustomCursor />
      <Navbar lang={lang} />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <a className={styles.scrollHint} href="#submit-product-form" aria-label="Go to marketplace status">
              <span>{availability.short}</span>
              <svg width="18" height="22" viewBox="0 0 18 22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M9 2v17" />
                <path d="m3 13 6 6 6-6" />
              </svg>
            </a>
            <h1>{t.title}</h1>
            <p>{t.lead}</p>

            <div className={styles.statusRail}>
              <span>{t.privacy}</span>
              <span>{t.review}</span>
              <span>{t.publish}</span>
            </div>
          </div>

          <aside className={styles.checklist}>
            <span>01 / ZIP</span>
            <h2>{t.checklistTitle}</h2>
            <ul>
              {(t.checklist as string[]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link href={skinTemplatePath(lang)}>{t.backToKit}</Link>
          </aside>
        </section>

        <section className={styles.formSection} id="submit-product-form">
          <SubmitProductForm lang={lang} />
        </section>
      </main>
    </div>
  )
}
