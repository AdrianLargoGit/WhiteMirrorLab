import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { DEFAULT_LOCALE, isLocale, wmlPath } from '@/lib/i18n'

export default async function WebRoot() {
  const headerLocale = (await headers()).get('x-wml-locale')
  const locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE
  redirect(wmlPath(locale, '/feed'))
}
