'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { homePath } from '@/lib/i18n'
import FaroAdColumns from './FaroAdColumns'
import './faro.css'

export default function FaroLayout({ children }: { children: ReactNode }) {
  const lang = useLocale()

  return (
    <div className="faro-app">
      <header className="faro-header">
        <Link href={homePath(lang)} className="faro-back">
          {lang === 'es' ? '<- Inicio' : '<- Home'}
        </Link>
        <span className="faro-brand">White Mirror Lab / FARO</span>
      </header>
      <FaroAdColumns locale={lang} />
      {children}
    </div>
  )
}
