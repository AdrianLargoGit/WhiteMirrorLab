interface AuthErrorLike {
  message?: string
  code?: string
  status?: number
}

export function mapAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Ha ocurrido un error. Inténtalo de nuevo.'
  }

  const err = error as AuthErrorLike
  const msg = (err.message ?? '').toLowerCase()
  const code = (err.code ?? '').toLowerCase()

  if (
    code === 'email_not_confirmed' ||
    msg.includes('email not confirmed') ||
    msg.includes('email_not_confirmed')
  ) {
    return 'Debes confirmar tu email antes de acceder. Revisa tu bandeja de entrada (y spam) y luego inicia sesión.'
  }

  if (msg.includes('invalid login credentials') || code === 'invalid_credentials') {
    return 'Email o contraseña incorrectos.'
  }

  if (msg.includes('user already registered')) {
    return 'Este email ya está registrado. Inicia sesión o confirma tu email.'
  }

  if (err.message) return err.message
  return 'Ha ocurrido un error. Inténtalo de nuevo.'
}
