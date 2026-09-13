const EMAIL_PATTERN =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i

const COMMON_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'hotmail.es',
  'outlook.com',
  'outlook.es',
  'live.com',
  'live.es',
  'yahoo.com',
  'yahoo.es',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'msn.com',
] as const

function levenshteinDistance(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index)
  const current = Array.from({ length: b.length + 1 }, () => 0)

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i

    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }

    for (let j = 0; j <= b.length; j += 1) {
      previous[j] = current[j]
    }
  }

  return previous[b.length]
}

function looksLikeMisspelledCommonDomain(domain: string) {
  return COMMON_EMAIL_DOMAINS.some((commonDomain) => {
    if (domain === commonDomain) return false
    if (Math.abs(domain.length - commonDomain.length) > 2) return false

    return levenshteinDistance(domain, commonDomain) <= 2
  })
}

export function isValidEmailAddress(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
    return false
  }

  const domain = normalizedEmail.split('@').at(-1)
  return Boolean(domain && !looksLikeMisspelledCommonDomain(domain))
}
