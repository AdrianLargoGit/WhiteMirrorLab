'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import './contact.css'
import { useLocale } from '@/hooks/useLocale'
import { homePath } from '@/lib/i18n'

export default function ContactLayout({ children }: { children: ReactNode }) {
  const lang = useLocale()

  return (
    <div className="contact-app">
      <header className="contact-header">
        <Link href={homePath(lang)} className="contact-back">
          {lang === 'es' ? '<- Inicio' : '<- Home'}
        </Link>
        <span className="contact-brand">White Mirror Lab</span>
      </header>
      <main className="contact-main">{children}</main>
    </div>
  )
}
