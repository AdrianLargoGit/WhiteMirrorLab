import type { Locale } from './i18n'

interface AuthErrorLike {
  message?: string
  code?: string
  status?: number
}

const messages = {
  es: {
    generic: 'Ha ocurrido un error. Intentalo de nuevo.',
    emailNotConfirmed: 'Debes confirmar tu email antes de acceder. Revisa tu bandeja de entrada y spam, y luego inicia sesion.',
    invalidCredentials: 'Email o contrasena incorrectos.',
    alreadyRegistered: 'Este email ya esta registrado. Inicia sesion o confirma tu email.',
  },
  en: {
    generic: 'Something went wrong. Please try again.',
    emailNotConfirmed: 'You must confirm your email before signing in. Check your inbox and spam folder, then sign in.',
    invalidCredentials: 'Incorrect email or password.',
    alreadyRegistered: 'This email is already registered. Sign in or confirm your email.',
  },
} as const

export function mapAuthError(error: unknown, locale: Locale = 'es'): string {
  const t = messages[locale]

  if (!error || typeof error !== 'object') {
    return t.generic
  }

  const err = error as AuthErrorLike
  const msg = (err.message ?? '').toLowerCase()
  const code = (err.code ?? '').toLowerCase()

  if (
    code === 'email_not_confirmed' ||
    msg.includes('email not confirmed') ||
    msg.includes('email_not_confirmed')
  ) {
    return t.emailNotConfirmed
  }

  if (msg.includes('invalid login credentials') || code === 'invalid_credentials') {
    return t.invalidCredentials
  }

  if (msg.includes('user already registered')) {
    return t.alreadyRegistered
  }

  return err.message || t.generic
}
