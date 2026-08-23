export const LOCALE_COOKIE = 'wml_locale'

export type Locale = 'es' | 'en'

export const DEFAULT_LOCALE: Locale = 'es'

export const SUPPORTED_LOCALES: Locale[] = ['es', 'en']

export const ROUTES = {
  es: {
    home: '/',
    blog: '/blog',
    contact: '/contacto',
    download: '/descargar',
    marketplace: '/marketplace',
    skinTemplate: '/plantilla-skins',
    marketplaceSubmit: '/marketplace/submit',
    wml: '/web',
    publicProfile: '/p',
    legal: '/legal',
  },
  en: {
    home: '/en',
    blog: '/en/blog',
    contact: '/en/contact',
    download: '/en/download',
    marketplace: '/en/marketplace',
    skinTemplate: '/en/skin-template',
    marketplaceSubmit: '/en/marketplace/submit',
    wml: '/en/wml-1-0',
    publicProfile: '/en/p',
    legal: '/en/legal',
  },
} as const

export type LegalPage = 'legalNotice' | 'privacy' | 'cookies' | 'terms' | 'ethics'

export const LEGAL_SLUGS: Record<Locale, Record<LegalPage, string>> = {
  es: {
    legalNotice: 'aviso-legal',
    privacy: 'privacidad',
    cookies: 'cookies',
    terms: 'terminos',
    ethics: 'etica',
  },
  en: {
    legalNotice: 'legal-notice',
    privacy: 'privacy',
    cookies: 'cookies',
    terms: 'terms',
    ethics: 'ethics',
  },
}

const EN_TO_ES_LEGAL_SLUG = new Map(
  Object.entries(LEGAL_SLUGS.en).map(([page, slug]) => [
    slug,
    LEGAL_SLUGS.es[page as LegalPage],
  ])
)

const ES_TO_EN_LEGAL_SLUG = new Map(
  Object.entries(LEGAL_SLUGS.es).map(([page, slug]) => [
    slug,
    LEGAL_SLUGS.en[page as LegalPage],
  ])
)

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

export function contactPath(locale: Locale): string {
  return ROUTES[locale].contact
}

export function blogPath(locale: Locale): string {
  return ROUTES[locale].blog
}

export function downloadPath(locale: Locale): string {
  return ROUTES[locale].download
}

export function marketplacePath(locale: Locale): string {
  return ROUTES[locale].marketplace
}

export function skinTemplatePath(locale: Locale): string {
  return ROUTES[locale].skinTemplate
}

export function marketplaceSubmitPath(locale: Locale): string {
  return ROUTES[locale].marketplaceSubmit
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

export function legalPath(locale: Locale, page: LegalPage): string {
  return `${ROUTES[locale].legal}/${LEGAL_SLUGS[locale][page]}`
}

export function localizedHashPath(locale: Locale, hash: string): string {
  return `${homePath(locale)}${hash}`
}

export function toInternalPath(pathname: string): string {
  if (pathname === '/en') return '/'
  if (pathname === ROUTES.en.blog || pathname.startsWith(`${ROUTES.en.blog}/`)) {
    return pathname.replace(ROUTES.en.blog, ROUTES.es.blog)
  }
  if (pathname === ROUTES.en.contact) return ROUTES.es.contact
  if (pathname === ROUTES.en.download) return ROUTES.es.download
  if (pathname === ROUTES.en.marketplace || pathname.startsWith(`${ROUTES.en.marketplace}/`)) {
    return pathname.replace(ROUTES.en.marketplace, ROUTES.es.marketplace)
  }
  if (pathname === ROUTES.en.skinTemplate) return ROUTES.es.skinTemplate
  if (pathname === ROUTES.en.marketplaceSubmit) return ROUTES.es.marketplaceSubmit
  if (pathname === ROUTES.en.legal) return ROUTES.es.legal
  if (pathname.startsWith(`${ROUTES.en.legal}/`)) {
    const suffix = pathname.slice(ROUTES.en.legal.length + 1)
    const [slug, ...rest] = suffix.split('/')
    const spanishSlug = EN_TO_ES_LEGAL_SLUG.get(slug) ?? slug
    return `${ROUTES.es.legal}/${spanishSlug}${rest.length ? `/${rest.join('/')}` : ''}`
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
  if (internal === ROUTES.es.blog || internal.startsWith(`${ROUTES.es.blog}/`)) {
    return internal.replace(ROUTES.es.blog, ROUTES.en.blog)
  }
  if (internal === ROUTES.es.contact) return ROUTES.en.contact
  if (internal === ROUTES.es.download) return ROUTES.en.download
  if (internal === ROUTES.es.marketplace || internal.startsWith(`${ROUTES.es.marketplace}/`)) {
    return internal.replace(ROUTES.es.marketplace, ROUTES.en.marketplace)
  }
  if (internal === ROUTES.es.skinTemplate) return ROUTES.en.skinTemplate
  if (internal === ROUTES.es.marketplaceSubmit) return ROUTES.en.marketplaceSubmit
  if (internal === ROUTES.es.legal) return ROUTES.en.legal
  if (internal.startsWith(`${ROUTES.es.legal}/`)) {
    const suffix = internal.slice(ROUTES.es.legal.length + 1)
    const [slug, ...rest] = suffix.split('/')
    const englishSlug = ES_TO_EN_LEGAL_SLUG.get(slug) ?? slug
    return `${ROUTES.en.legal}/${englishSlug}${rest.length ? `/${rest.join('/')}` : ''}`
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
