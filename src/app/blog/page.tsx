import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import CustomCursor from '@/components/CustomCursor'
import { EvidenceAgeGate } from '@/components/blog/EvidenceAgeGate'
import Navbar from '@/components/Navbar'
import { getEvidenceArchiveStatus } from '@/lib/blogArchiveZip'
import { blogUiCopy, caseHref, getLocalizedCase } from '@/lib/blogLocale'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n'
import { formatBlogEvidencePrice } from '@/lib/stripeEvidence'
import { unsolvedSerialCases } from '@/lib/unsolvedSerialCases'
import styles from './page.module.css'

export const metadata = {
  title: 'Blog | White Mirror Lab',
  description: blogUiCopy.es.metaDescription,
}

const IconDownload = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M4 21h16" />
  </svg>
)

export default async function BlogPage() {
  const headerLocale = (await headers()).get('x-wml-locale')
  const lang: Locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE
  const t = blogUiCopy[lang]
  const cases = unsolvedSerialCases.map((item) => getLocalizedCase(item, lang))

  return (
    <div className="landing-page">
      <CustomCursor variant="magnifier" />
      <Navbar lang={lang} />

      <main className={styles.page}>
        <section className={styles.hero}>
          <Image
            src="/blog-detective-archive.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroContent}>
            <div className="section-label">{t.eyebrow}</div>
            <h1>{t.title}</h1>
            <p>{t.lead}</p>
            <div className={styles.heroStats} aria-label={lang === 'es' ? 'Resumen del archivo' : 'Archive summary'}>
              {t.stats.map((stat, index) => (
                <span key={`blog-stat-${index}`}>{stat}</span>
              ))}
            </div>
          </div>
        </section>

        <nav className={styles.index} aria-label={t.indexLabel}>
          {cases.map((item, index) => (
            <Link key={item.slug} href={caseHref(lang, item.slug)}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item.title}
            </Link>
          ))}
        </nav>

        <section className={styles.intro}>
          <div>
            <div className="section-label">{t.introEyebrow}</div>
            <h2>{t.introTitle}</h2>
          </div>
          <p>{t.introText}</p>
        </section>

        <div className={styles.grid}>
          {cases.map((item, index) => {
            const hasEvidenceArchive = getEvidenceArchiveStatus(item).isMarketable
            const evidencePrice = formatBlogEvidencePrice(lang, item)

            return (
            <article key={item.slug} className={styles.card}>
              <Link href={caseHref(lang, item.slug)} className={styles.cardMain}>
                <div className={styles.cardTop}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span>{item.activeYears}</span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.subtitle}</p>
                <dl>
                  <div>
                    <dt>{t.place}</dt>
                    <dd>{item.location}</dd>
                  </div>
                  <div>
                    <dt>{t.status}</dt>
                    <dd>{item.status}</dd>
                  </div>
                </dl>
              </Link>
              <div className={styles.cardActions}>
                <Link href={caseHref(lang, item.slug)}>{t.readArticle}</Link>
                {hasEvidenceArchive ? (
                  <EvidenceAgeGate
                    className={styles.downloadButton}
                    href={`/api/blog/download?case=${item.slug}&lang=${lang}`}
                    label={t.ageGate}
                  >
                    <IconDownload />
                    <span>{t.downloadZip} / {evidencePrice}</span>
                  </EvidenceAgeGate>
                ) : null}
              </div>
            </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}
