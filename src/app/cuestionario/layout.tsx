'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import './quiz.css'
import { useLocale } from '@/hooks/useLocale'
import { homePath } from '@/lib/i18n'

export default function CuestionarioLayout({ children }: { children: ReactNode }) {
  const lang = useLocale()

  return (
    <div className="quiz-app">
      <header className="quiz-header">
        <Link href={homePath(lang)} className="quiz-back">
          {lang === 'es' ? '<- Inicio' : '<- Home'}
        </Link>
        <span className="quiz-brand">White Mirror Lab</span>
      </header>
      <main className="quiz-main">{children}</main>
    </div>
  )
}
