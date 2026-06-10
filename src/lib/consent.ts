export const CONSENT_COOKIE = 'wml_consent_v1'
export const CONSENT_MAX_AGE = 365 * 24 * 60 * 60 // 1 year

export function setConsentCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${CONSENT_COOKIE}=1; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax`
}

export function clearConsentCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${CONSENT_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

export function hasConsentCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${CONSENT_COOKIE}=`))
}
