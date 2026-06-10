export function getPublicProfileUrl(username: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/p/${username}`
  }
  return `/p/${username}`
}

export function getShareMessage(displayName: string, username: string, karma: number): string {
  const karmaStr = karma > 0 ? `+${karma}` : String(karma)
  return `¿Qué karma le das a ${displayName} (@${username})? Tiene ${karmaStr} en WML 1.0 — vota anónimamente:`
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
