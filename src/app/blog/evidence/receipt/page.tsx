import Link from 'next/link'
import { headers } from 'next/headers'
import CustomCursor from '@/components/CustomCursor'
import Navbar from '@/components/Navbar'
import { blogUiCopy, caseHref, getLocalizedCase } from '@/lib/blogLocale'
import { DEFAULT_LOCALE, blogPath, isLocale, type Locale } from '@/lib/i18n'
import {
  formatBlogEvidencePrice,
  formatBlogEvidencePriceCents,
  getCheckoutSessionPrice,
  isStripeCheckoutSessionId,
  retrieveStripeCheckoutSession,
} from '@/lib/stripeEvidence'
import { findUnsolvedSerialCase } from '@/lib/unsolvedSerialCases'
import { AutoEvidenceDownload } from './AutoEvidenceDownload'
import styles from './page.module.css'

type PageProps = {
  searchParams: Promise<{
    case?: string
    session_id?: string
  }>
}

export const metadata = {
  title: 'Evidence Receipt | White Mirror Lab',
}

export default async function EvidenceReceiptPage({ searchParams }: PageProps) {
  const params = await searchParams
  const headerLocale = (await headers()).get('x-wml-locale')
  const lang: Locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE
  const caseFile = findUnsolvedSerialCase(params.case ?? null)
  const item = caseFile ? getLocalizedCase(caseFile, lang) : null
  const t = blogUiCopy[lang]
  const hasValidSession = isStripeCheckoutSessionId(params.session_id)
  let price = formatBlogEvidencePrice(lang, caseFile ?? undefined)

  if (hasValidSession) {
    try {
      const session = await retrieveStripeCheckoutSession(params.session_id ?? '')
      const paidPrice = getCheckoutSessionPrice(session)

      if (paidPrice && (!caseFile || session.metadata?.case_slug === caseFile.slug)) {
        price = formatBlogEvidencePriceCents(lang, paidPrice.cents, paidPrice.currency)
      }
    } catch {
      price = formatBlogEvidencePrice(lang, caseFile ?? undefined)
    }
  }

  const canDownload = item !== null && hasValidSession
  const downloadHref = item && hasValidSession
    ? `/api/blog/evidence-file?case=${item.slug}&session_id=${encodeURIComponent(params.session_id ?? '')}`
    : blogPath(lang)

  return (
    <div className="landing-page">
      <CustomCursor variant="magnifier" />
      <Navbar lang={lang} />

      <main className={styles.page}>
        <AutoEvidenceDownload href={downloadHref} enabled={canDownload} />
        <section className={styles.panel}>
          <div className={styles.kicker}>WML / Evidence receipt</div>
          <span className={styles.price}>{price}</span>
          <h1>
            {canDownload
              ? lang === 'es' ? 'Pago confirmado.' : 'Payment confirmed.'
              : lang === 'es' ? 'Recibo pendiente.' : 'Receipt pending.'}
          </h1>
          <p>
            {item
              ? canDownload
                ? lang === 'es'
                  ? `Tu dossier de ${item.title} esta listo. La descarga empezara automaticamente en unos segundos.`
                  : `Your ${item.title} dossier is ready. The download will start automatically in a few seconds.`
                : lang === 'es'
                  ? 'Todavia no ha llegado un identificador real de Stripe. Vuelve al expediente e inicia el pago desde el boton de compra.'
                  : 'A real Stripe session ID has not arrived yet. Go back to the case file and start payment from the buy button.'
              : lang === 'es'
                ? 'No hemos podido identificar el expediente asociado a este recibo.'
                : 'We could not identify the case file attached to this receipt.'}
          </p>
          <p className={styles.pcNotice}>{t.pcRecommendation}</p>

          <div className={styles.actions}>
            <a className={styles.primaryButton} href={downloadHref}>
              {lang === 'es' ? 'Descargar de nuevo' : 'Download again'}
            </a>
            <Link className={styles.secondaryButton} href={item ? caseHref(lang, item.slug) : blogPath(lang)}>
              {lang === 'es' ? 'Volver al expediente' : 'Back to case file'}
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
