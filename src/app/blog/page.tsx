import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import CustomCursor from '@/components/CustomCursor'
import Navbar from '@/components/Navbar'
import { blogPath, DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n'
import AdPosterBackground from './AdPosterBackground'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Blog | White Mirror Lab',
  description: 'Blog editorial de White Mirror Lab.',
}

const copy = {
  es: {
    label: 'White Mirror Lab',
    title: '¿Así se ven los blogs actuales?',
    body: 'Un blog atrapado entre anuncios, ruido y pequeñas ventanas de atención.',
    cta: 'Lee artículos jugando',
  },
  en: {
    label: 'White Mirror Lab',
    title: 'Is this what blogs look like now?',
    body: 'A blog caught between ads, noise and small windows of attention.',
    cta: 'Read articles while playing',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function BlogPage() {
  const headerLocale = (await headers()).get('x-wml-locale')
  const lang: Locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE
  const t = copy[lang]
  const playHref = `${blogPath(lang)}/roguelike`

  return (
    <main className={styles.page}>
      <CustomCursor />
      <Navbar lang={lang} />
      <AdPosterBackground locale={lang} />

      <div className={styles.content}>
        <section className={styles.blogQuestion}>
          <span>{t.label}</span>
          <h1>{t.title}</h1>
          <p>{t.body}</p>
          <Link href={playHref}>{t.cta}</Link>
        </section>
      </div>
    </main>
  )
}
