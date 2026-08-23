import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import CustomCursor from '@/components/CustomCursor'
import { EvidenceAgeGate } from '@/components/blog/EvidenceAgeGate'
import Navbar from '@/components/Navbar'
import { getEvidenceArchiveStatus } from '@/lib/blogArchiveZip'
import { getCaseDetails, getCaseTimeline, localizeText } from '@/lib/blogCaseDetails'
import { blogUiCopy, caseHref, getLocalizedCase } from '@/lib/blogLocale'
import { getVictimSceneNotes, localizeVictimScene } from '@/lib/blogVictimScenes'
import { DEFAULT_LOCALE, blogPath, isLocale, type Locale } from '@/lib/i18n'
import { formatBlogEvidencePrice } from '@/lib/stripeEvidence'
import { findUnsolvedSerialCase, unsolvedSerialCases } from '@/lib/unsolvedSerialCases'
import styles from './page.module.css'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

const IconDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M4 21h16" />
  </svg>
)

export function generateStaticParams() {
  return unsolvedSerialCases.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const caseFile = findUnsolvedSerialCase(slug)

  if (!caseFile) {
    return {
      title: `${blogUiCopy.es.notFoundTitle}`,
    }
  }

  return {
    title: `${caseFile.title} | Blog White Mirror Lab`,
    description: caseFile.summary,
  }
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params
  const caseFile = findUnsolvedSerialCase(slug)
  const headerLocale = (await headers()).get('x-wml-locale')
  const lang: Locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE
  const t = blogUiCopy[lang]

  if (!caseFile) notFound()

  const item = getLocalizedCase(caseFile, lang)
  const details = getCaseDetails(caseFile.slug)
  const timeline = getCaseTimeline(caseFile.slug)
  const victimScenes = getVictimSceneNotes(caseFile.slug).map((note) => localizeVictimScene(note, lang))
  const currentIndex = unsolvedSerialCases.findIndex((entry) => entry.slug === caseFile.slug)
  const nextBaseCase = unsolvedSerialCases[(currentIndex + 1) % unsolvedSerialCases.length] ?? caseFile
  const nextCase = getLocalizedCase(nextBaseCase, lang)
  const hasEvidenceArchive = getEvidenceArchiveStatus(caseFile).isMarketable
  const evidencePrice = formatBlogEvidencePrice(lang, caseFile)

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
            <Link href={blogPath(lang)} className={styles.backLink}>{t.backToBlog}</Link>
            <div className={styles.articleMeta}>
              <span>{item.location}</span>
              <span>{item.activeYears}</span>
              <span>{item.dossierCode}</span>
            </div>
            <h1>{item.title}</h1>
            <p>{item.subtitle}</p>
            <div className={styles.downloadRow}>
              {hasEvidenceArchive ? (
                <>
                  <EvidenceAgeGate
                    className={styles.downloadButton}
                    href={`/api/blog/download?case=${item.slug}&lang=${lang}`}
                    label={t.ageGate}
                  >
                    <IconDownload />
                    <span>{t.downloadZip} / {evidencePrice}</span>
                  </EvidenceAgeGate>
                  <span>{t.downloadHint.replace('{price}', evidencePrice)}</span>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section className={styles.bodyLayout}>
          <aside className={styles.facts}>
            <dl>
              <div>
                <dt>{t.victims}</dt>
                <dd>{item.victims}</dd>
              </div>
              <div>
                <dt>{t.status}</dt>
                <dd>{item.status}</dd>
              </div>
              <div>
                <dt>{t.period}</dt>
                <dd>{item.activeYears}</dd>
              </div>
              <div>
                <dt>{t.archive}</dt>
                <dd>{item.dossierCode}</dd>
              </div>
            </dl>
          </aside>

          <article className={styles.article}>
            <p className={styles.summary}>{item.summary}</p>

            <section className={styles.timelineBlock}>
              <h2>{t.timeline}</h2>
              <ol className={styles.timeline}>
                {timeline.map((event, index) => (
                  <li key={`timeline-${caseFile.slug}-${index}`} className={styles.timelineItem}>
                    <span className={styles.timelineDate}>{event.date}</span>
                    <div>
                      <h3>{localizeText(event.title, lang)}</h3>
                      <p>{localizeText(event.body, lang)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {item.article.map((section, sectionIndex) => (
              <section key={`article-${caseFile.slug}-${sectionIndex}`} className={styles.articleSection}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`article-${caseFile.slug}-${sectionIndex}-${paragraphIndex}`}>{paragraph}</p>
                ))}
              </section>
            ))}

            <section className={styles.victimScenes}>
              <h2>{t.victimScenes}</h2>
              <div className={styles.sceneGrid}>
                {victimScenes.map((scene, index) => (
                  <article key={`scene-${caseFile.slug}-${index}`} className={styles.sceneCard}>
                    <span>{scene.date}</span>
                    <h3>{scene.victim}</h3>
                    <p><strong>{scene.location}</strong></p>
                    <p>{scene.scene}</p>
                    <p>{scene.investigation}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.extendedBlock}>
              <h2>{t.extendedInfo}</h2>
              {details.sections.map((section, sectionIndex) => (
                <section key={`details-${caseFile.slug}-${sectionIndex}`} className={styles.articleSection}>
                  <h3>{localizeText(section.title, lang)}</h3>
                  {section.body.map((paragraph, paragraphIndex) => (
                    <p key={`details-${caseFile.slug}-${sectionIndex}-${paragraphIndex}`}>{localizeText(paragraph, lang)}</p>
                  ))}
                </section>
              ))}
            </section>

            <section className={styles.archiveBox}>
              <h2>{t.archiveIncludes}</h2>
              <ul>
                {item.archiveNotes.map((note, index) => (
                  <li key={`archive-${caseFile.slug}-${index}`}>{note}</li>
                ))}
                {details.dossierOnly.map((note, index) => (
                  <li key={`dossier-${caseFile.slug}-${index}`}>{localizeText(note, lang)}</li>
                ))}
              </ul>
            </section>

            <Link className={styles.nextArticle} href={caseHref(lang, nextCase.slug)}>
              <span>{t.nextCase}</span>
              <strong>{nextCase.title}</strong>
              <small>{nextCase.location} / {nextCase.activeYears}</small>
            </Link>
          </article>
        </section>
      </main>
    </div>
  )
}
