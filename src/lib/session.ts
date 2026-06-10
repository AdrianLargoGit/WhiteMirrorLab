/**
 * Generates a persistent, anonymised session hash stored in sessionStorage.
 * Never tied to a user identity — used only for behavioral analytics.
 */
export function getSessionHash(): string {
  if (typeof window === 'undefined') return 'ssr'
  const key = 'wml_session_hash'
  let hash = sessionStorage.getItem(key)
  if (!hash) {
    hash = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    sessionStorage.setItem(key, hash)
  }
  return hash
}