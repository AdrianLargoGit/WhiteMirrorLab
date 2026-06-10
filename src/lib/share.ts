import { publicProfilePath, type Locale } from './i18n'

export function getPublicProfileUrl(username: string, locale: Locale = 'es'): string {
  const path = publicProfilePath(locale, username)
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  return path
}

export function getShareMessage(
  displayName: string,
  username: string,
  karma: number,
  locale: Locale = 'es'
): string {
  const karmaStr = karma > 0 ? `+${karma}` : String(karma)
  if (locale === 'en') {
    return `What karma would you give ${displayName} (@${username})? Current karma: ${karmaStr} in WML 1.0. Vote anonymously:`
  }
  return `Que karma le das a ${displayName} (@${username})? Tiene ${karmaStr} en WML 1.0. Vota anonimamente:`
}

export function getWhatsAppShareUrl(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
