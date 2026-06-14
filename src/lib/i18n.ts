'use client'
import { usePathname } from 'next/navigation' // 👈 Importamos el hook nativo de Next.js

export const LOCALE_COOKIE = 'wml_locale'

export type Locale = 'es' | 'en'

export const DEFAULT_LOCALE: Locale = 'es'

export const SUPPORTED_LOCALES: Locale[] = ['es', 'en']

export const ROUTES = {
  es: {
    home: '/',
    questionnaire: '/cuestionario',
    wml: '/web',
    publicProfile: '/p',
    legal: '/legal',
  },
  en: {
    home: '/en',
    questionnaire: '/en/questionnaire',
    wml: '/en/wml-1-0',
    publicProfile: '/en/p',
    legal: '/en/legal',
  },
} as const

const WML_ROUTE_ALIASES = new Map([
  ['/', '/'],
  ['/consent', '/consent'],
  ['/auth', '/auth'],
  ['/feed', '/feed'],
  ['/ranking', '/ranking'],
  ['/upload', '/upload'],
  ['/me', '/me'],
  ['/profile', '/profile'],
  ['/pulses', '/pulses'],
])

export const WML_ROUTES = {
  feed:    '/web/feed',
  pulses:  '/web/pulses',
  ranking: '/web/ranking',
  upload:  '/web/upload',
  auth:    '/web/auth',
  profile: (username: string) => `/web/profile/${username}`,
} as const

export function isLocale(value: unknown): value is Locale {
  return value === 'es' || value === 'en'
}

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/')
    ? 'en'
    : DEFAULT_LOCALE
}

export function getLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE

  const first = header
    .split(',')
    .map((part) => part.trim().split(';')[0]?.toLowerCase())
    .find(Boolean)

  return first?.startsWith('en') ? 'en' : DEFAULT_LOCALE
}

export function homePath(locale: Locale): string {
  return ROUTES[locale].home
}

export function questionnairePath(locale: Locale): string {
  return ROUTES[locale].questionnaire
}

export function wmlPath(locale: Locale, path = ''): string {
  const suffix = path.startsWith('/') ? path : `/${path}`
  return suffix === '/' ? ROUTES[locale].wml : `${ROUTES[locale].wml}${suffix}`
}

export function wmlProfilePath(locale: Locale, username: string): string {
  return wmlPath(locale, `/profile/${username}`)
}

export function publicProfilePath(locale: Locale, username: string): string {
  return `${ROUTES[locale].publicProfile}/${username}`
}

export function localizedHashPath(locale: Locale, hash: string): string {
  return `${homePath(locale)}${hash}`
}

export function toInternalPath(pathname: string): string {
  if (pathname === '/en') return '/'
  if (pathname === ROUTES.en.questionnaire) return ROUTES.es.questionnaire
  if (pathname === ROUTES.en.legal) return ROUTES.es.legal
  if (pathname.startsWith(`${ROUTES.en.legal}/`)) {
    return pathname.replace(ROUTES.en.legal, ROUTES.es.legal)
  }
  if (pathname.startsWith(`${ROUTES.en.publicProfile}/`)) {
    return pathname.replace(ROUTES.en.publicProfile, ROUTES.es.publicProfile)
  }
  if (pathname === ROUTES.en.wml) return ROUTES.es.wml
  if (pathname.startsWith(`${ROUTES.en.wml}/`)) {
    const wmlSuffix = pathname.slice(ROUTES.en.wml.length)
    const [first, ...rest] = wmlSuffix.split('/').filter(Boolean)
    const alias = WML_ROUTE_ALIASES.get(`/${first}`)
    if (!alias) return pathname
    return `${ROUTES.es.wml}${alias}${rest.length ? `/${rest.join('/')}` : ''}`
  }
  return pathname
}

export function alternateLocalePath(pathname: string, nextLocale: Locale): string {
  const internal = toInternalPath(pathname)
  if (nextLocale === 'es') return internal
  if (internal === '/') return ROUTES.en.home
  if (internal === ROUTES.es.questionnaire) return ROUTES.en.questionnaire
  if (internal === ROUTES.es.legal) return ROUTES.en.legal
  if (internal.startsWith(`${ROUTES.es.legal}/`)) {
    return internal.replace(ROUTES.es.legal, ROUTES.en.legal)
  }
  if (internal.startsWith(`${ROUTES.es.publicProfile}/`)) {
    return internal.replace(ROUTES.es.publicProfile, ROUTES.en.publicProfile)
  }
  if (internal === ROUTES.es.wml) return ROUTES.en.wml
  if (internal.startsWith(`${ROUTES.es.wml}/`)) {
    return internal.replace(ROUTES.es.wml, ROUTES.en.wml)
  }
  return internal
}

/**
 * 👑 HOOK: useLocale
 * Devuelve de forma reactiva el idioma actual leyendo la URL del navegador.
 * Puede usarse en cualquier Client Component ('use client').
 */
export function useLocale(): Locale {
  const pathname = usePathname()
  if (!pathname) return DEFAULT_LOCALE
  return getLocaleFromPathname(pathname)
}