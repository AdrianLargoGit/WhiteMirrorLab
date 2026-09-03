import crypto from 'crypto'

export type FaroPublicState = {
  dateKey: string
  message: string
  status: 'default' | 'pending' | 'live'
  publishedAt: string | null
  canSubmit: boolean
}

type FaroDayState = {
  dateKey: string
  pendingMessage?: string
  pendingAuthor?: string
  submittedAt?: string
  adminMessage?: string
  adminUpdatedAt?: string
  usedPasswords: Set<string>
}

type FaroStateStore = {
  days: Record<string, FaroDayState>
}

const FARO_TIME_ZONE = 'Europe/Madrid'
const FARO_PUBLISH_HOUR = 20
const DEFAULT_MESSAGE =
  'Hoy FARO permanece en silencio. Mañana volverá a mirar hacia otro punto.'

const FORBIDDEN_PATTERNS = [
  /\b(matar|violar|suicid(?:io|arme|arte)|terrorismo|bomba)\b/i,
  /\b(kill|rape|suicide|terroris[mt]|bomb)\b/i,
  /\b(nazi|hitler|fascista|fascist)\b/i,
  /\b(puta|puto|mierda|joder|gilipollas|cabr[oó]n)\b/i,
  /\b(fuck|shit|bitch|cunt|asshole)\b/i,
]

const normalizeDateParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: FARO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00'

  return {
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number(get('hour')),
    minute: Number(get('minute')),
  }
}

const getPreviousDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  const utcNoon = Date.UTC(year, month - 1, day, 12)

  return normalizeDateParts(new Date(utcNoon - 24 * 60 * 60 * 1000)).dateKey
}

const getStateStore = (dateKey = normalizeDateParts().dateKey) => {
  const globalStore = globalThis as typeof globalThis & {
    __wmlFaroState?: FaroDayState | FaroStateStore
  }

  if (!globalStore.__wmlFaroState || !('days' in globalStore.__wmlFaroState)) {
    const previousState = globalStore.__wmlFaroState
    globalStore.__wmlFaroState = { days: {} }

    if (previousState?.dateKey) {
      globalStore.__wmlFaroState.days[previousState.dateKey] = previousState
    }
  }

  if (!globalStore.__wmlFaroState.days[dateKey]) {
    globalStore.__wmlFaroState.days[dateKey] = {
      dateKey,
      usedPasswords: new Set(),
    }
  }

  return globalStore.__wmlFaroState.days[dateKey]
}

const getExistingStateStore = (dateKey: string) => {
  const globalStore = globalThis as typeof globalThis & {
    __wmlFaroState?: FaroDayState | FaroStateStore
  }

  if (!globalStore.__wmlFaroState) return undefined
  if ('days' in globalStore.__wmlFaroState) return globalStore.__wmlFaroState.days[dateKey]
  return globalStore.__wmlFaroState.dateKey === dateKey ? globalStore.__wmlFaroState : undefined
}

export const getFaroTodayKey = () => normalizeDateParts().dateKey

export const isFaroPublishTime = () => {
  const { hour } = normalizeDateParts()
  return hour >= FARO_PUBLISH_HOUR
}

export const isFaroSubmissionOpen = () => !isFaroPublishTime()

const getPasswordSecret = () => process.env.FARO_PASSWORD_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'wml-faro-local-secret'

export const getFaroDailyPassword = (dateKey = getFaroTodayKey()) => (
  crypto
    .createHmac('sha256', getPasswordSecret())
    .update(`faro:${dateKey}`)
    .digest('base64url')
    .slice(0, 12)
    .toUpperCase()
)

export const verifyFaroPassword = (password: string) => {
  const expected = getFaroDailyPassword()
  const left = Buffer.from(password.trim().toUpperCase())
  const right = Buffer.from(expected)

  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export const sanitizeFaroMessage = (message: string) => (
  message
    .replace(/\s+/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
)

export const validateFaroMessage = (message: string) => {
  const clean = sanitizeFaroMessage(message)

  if (clean.length < 2) {
    return { ok: false as const, error: 'El mensaje es demasiado corto.' }
  }

  if (clean.length > 240) {
    return { ok: false as const, error: 'El mensaje no puede superar 240 caracteres.' }
  }

  if (/https?:\/\/|www\.|@[a-z0-9_.-]+/i.test(clean)) {
    return { ok: false as const, error: 'FARO no acepta enlaces, emails ni menciones.' }
  }

  if (FORBIDDEN_PATTERNS.some((pattern) => pattern.test(clean))) {
    return { ok: false as const, error: 'Ese mensaje no pasa la moderación básica.' }
  }

  return { ok: true as const, message: clean }
}

export const getFaroPublicState = (): FaroPublicState => {
  const today = normalizeDateParts()
  const state = getStateStore(today.dateKey)
  const publishTime = today.hour >= FARO_PUBLISH_HOUR
  const previousState = getExistingStateStore(getPreviousDateKey(state.dateKey))
  const liveState = state.adminMessage || publishTime ? state : previousState
  const liveMessage = liveState?.adminMessage ?? liveState?.pendingMessage
  const status = liveMessage
    ? 'live'
    : state.pendingMessage
    ? 'pending'
    : 'default'

  return {
    dateKey: liveMessage ? liveState.dateKey : state.dateKey,
    message: liveMessage ?? DEFAULT_MESSAGE,
    status,
    publishedAt: liveMessage ? liveState.adminUpdatedAt ?? `${liveState.dateKey}T20:00:00+01:00` : null,
    canSubmit: isFaroSubmissionOpen() && !state.pendingMessage,
  }
}

export const submitFaroMessage = (password: string, message: string, author?: string) => {
  const state = getStateStore()
  const normalizedPassword = password.trim().toUpperCase()

  if (!isFaroSubmissionOpen()) {
    return { ok: false as const, status: 403, error: 'El plazo de hoy ha terminado.' }
  }

  if (!verifyFaroPassword(normalizedPassword)) {
    return { ok: false as const, status: 401, error: 'Contraseña incorrecta.' }
  }

  if (state.usedPasswords.has(normalizedPassword) || state.pendingMessage) {
    return { ok: false as const, status: 409, error: 'La frase de hoy ya está cerrada.' }
  }

  const validation = validateFaroMessage(message)
  if (!validation.ok) {
    return { ok: false as const, status: 422, error: validation.error }
  }

  state.pendingMessage = validation.message
  state.pendingAuthor = author?.trim().toLowerCase()
  state.submittedAt = new Date().toISOString()
  state.usedPasswords.add(normalizedPassword)

  return { ok: true as const }
}

export const setFaroAdminMessage = (adminSecret: string, message: string) => {
  if (!process.env.FARO_ADMIN_SECRET || adminSecret !== process.env.FARO_ADMIN_SECRET) {
    return { ok: false as const, status: 401, error: 'Clave de administrador incorrecta.' }
  }

  const validation = validateFaroMessage(message)
  if (!validation.ok) {
    return { ok: false as const, status: 422, error: validation.error }
  }

  const state = getStateStore()
  state.adminMessage = validation.message
  state.adminUpdatedAt = new Date().toISOString()

  return { ok: true as const }
}
