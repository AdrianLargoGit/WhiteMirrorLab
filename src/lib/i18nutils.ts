'use client' // 👈 Importante

import { usePathname } from 'next/navigation'
import { getLocaleFromPathname, DEFAULT_LOCALE, type Locale } from './i18n'

export function useLocale(): Locale {
  const pathname = usePathname()
  if (!pathname) return DEFAULT_LOCALE
  return getLocaleFromPathname(pathname)
}