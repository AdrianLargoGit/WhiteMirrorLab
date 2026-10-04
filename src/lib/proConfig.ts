import { WIDGET_DOWNLOAD_URL } from './widgetDownload'

export type ProBillingPlan = 'monthly' | 'annual'

export const PRO_PLANS = {
  monthly: { amount: 499, interval: 'month' },
  annual: { amount: 4599, interval: 'year' },
} as const

export const PRO_PRICE_LOOKUP_VERSION = 'v2'

export class ProError extends Error {
  constructor(public code: string, public status = 503) {
    super(code)
  }
}

export function proEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new ProError('pro_not_configured')
  return value
}

function configuredUrl(name: string) {
  const url = new URL(proEnv(name))
  if (url.protocol !== 'https:' || url.username || url.password) throw new ProError('pro_not_configured')
  return url
}

export function proOrigin() {
  const value = process.env.WML_PRO_SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.whitemirrorlab.com'
  const url = new URL(value)
  if (url.username || url.password || (url.protocol !== 'https:' &&
      !(process.env.NODE_ENV !== 'production' && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))) {
    throw new ProError('pro_not_configured')
  }
  return url.origin
}

export function proAllowedOrigin(value: string | null) {
  if (!value) throw new ProError('invalid_origin', 403)
  let url: URL
  try { url = new URL(value) } catch { throw new ProError('invalid_origin', 403) }
  const configured = new URL(proOrigin())
  const local = process.env.NODE_ENV !== 'production' && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)
  const sameSite = url.protocol === configured.protocol && url.port === configured.port &&
    (url.hostname === configured.hostname || url.hostname.replace(/^www\./, '') === configured.hostname.replace(/^www\./, ''))
  if (url.username || url.password || (!sameSite && !local)) throw new ProError('invalid_origin', 403)
  return url.origin
}

export function proInstallerUrl() {
  const url = new URL(WIDGET_DOWNLOAD_URL)
  if (url.protocol !== 'https:' || url.username || url.password) throw new ProError('pro_not_configured')
  return url.toString()
}

export function proPortalLoginUrl() {
  const url = configuredUrl('WML_PRO_PORTAL_LOGIN_URL')
  if (url.hostname !== 'billing.stripe.com' || !url.pathname.startsWith('/p/login/')) {
    throw new ProError('pro_not_configured')
  }
  return url.toString()
}

export function proPriceId(plan: ProBillingPlan) {
  const id = process.env[plan === 'annual' ? 'WML_PRO_STRIPE_ANNUAL_PRICE_ID' : 'WML_PRO_STRIPE_MONTHLY_PRICE_ID']?.trim()
  if (id && !/^price_[A-Za-z0-9]+$/.test(id)) throw new ProError('pro_not_configured')
  return id
}

export const PRO_CHECKOUT_COOKIE = 'wml_pro_checkout'
export const PRO_SESSION_COOKIE = 'wml_pro_session'
export const PRO_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/pro',
  maxAge: 30 * 24 * 60 * 60,
}

export const PRO_PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' }
