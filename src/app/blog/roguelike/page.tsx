import type { Metadata } from 'next'
import { headers } from 'next/headers'
import CustomCursor from '@/components/CustomCursor'
import Navbar from '@/components/Navbar'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n'
import RoguelikeGame from './RoguelikeGame'
import styles from './roguelike.module.css'

export const metadata: Metadata = {
  title: 'Roguelike | White Mirror Lab',
  description: 'Roguelike táctico de White Mirror Lab.',
}

export default async function BlogRoguelikePage() {
  const headerLocale = (await headers()).get('x-wml-locale')
  const lang: Locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE

  return (
    <main className={styles.page}>
      <CustomCursor />
      <Navbar lang={lang} />
      <RoguelikeGame locale={lang} />
    </main>
  )
}
