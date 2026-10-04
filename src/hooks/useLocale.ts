'use client'

import { useContext } from 'react'
import { usePathname } from 'next/navigation'
import { getLocaleFromPathname, type Locale } from '@/lib/i18n'
import { LocaleContext } from '@/lib/localeContext'

export function useLocale(): Locale {
  const pathname = usePathname()
  const serverLocale = useContext(LocaleContext)
  return getLocaleFromPathname(pathname) === 'en' ? 'en' : serverLocale
}
