'use client'

import { usePathname } from 'next/navigation'
import { getLocaleFromPathname, isLocale, LOCALE_COOKIE, type Locale } from '@/lib/i18n'

function getCookieLocale(): Locale | null {
  if (typeof document === 'undefined') return null
  const value = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`))
    ?.split('=')[1]
  return isLocale(value) ? value : null
}

export function useLocale(): Locale {
  const pathname = usePathname()
  const browserPathname = typeof window === 'undefined' ? pathname : window.location.pathname
  const pathLocale = getLocaleFromPathname(browserPathname)
  return pathLocale === 'en' ? 'en' : getCookieLocale() ?? pathLocale
}
