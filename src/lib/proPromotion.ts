// Exclusive deadline: the whole of 18 November is included, in Europe/Madrid.
export const PRO_TRIAL_CAMPAIGN = 'pro-seven-days-november-2026'
export const PRO_TRIAL_START = Date.parse('2026-11-10T00:00:00+01:00')
export const PRO_TRIAL_END = Date.parse('2026-11-19T00:00:00+01:00')
export const PRO_TRIAL_SECONDS = 7 * 24 * 60 * 60

export function isProPromotionDate(now: number) {
  return Number.isFinite(now) && now >= PRO_TRIAL_START && now < PRO_TRIAL_END
}

export const proPromotionCopy = {
  es: {
    headline: 'Plan PRO gratis hasta el GTA VI',
    shortTerms: '7 días de prueba · Tarjeta requerida',
    free: 'Gratis ahora', days: '7 días de Pro', label: 'WML X.X.0 PRO · OFERTA DE LANZAMIENTO',
    remaining: 'Tiempo para activar la oferta', units: ['días', 'horas', 'min', 'seg'],
    deadline: 'Hasta el 18 de noviembre, 23:59:59 (Madrid).',
    terms: 'Tarjeta obligatoria. Solo nuevas altas, una prueba por correo. Después, renovación automática al precio elegido, salvo que canceles antes de terminar los 7 días.',
    checkout: 'Activar 7 días gratis',
    unavailable: 'La prueba ya no está disponible para esta alta. Revisa el precio y acepta de nuevo las condiciones para contratar el plan de pago.',
    expired: 'La oferta terminó antes de completar el alta. No se ha creado ninguna suscripción ni se ha realizado ningún cobro. Puedes contratar Pro desde los planes actuales.',
    trialActive: 'Tu prueba de 7 días está activa', trialUntil: 'Prueba gratis hasta',
    after: 'Después', cancel: 'Cancela antes de esa fecha desde Gestionar suscripción para evitar el primer cobro.',
  },
  en: {
    headline: 'PRO plan free until GTA VI',
    shortTerms: '7-day trial · Card required',
    free: 'Free now', days: '7 days of Pro', label: 'WML X.X.0 PRO · LAUNCH OFFER',
    remaining: 'Time left to claim the offer', units: ['days', 'hours', 'min', 'sec'],
    deadline: 'Until 18 November, 23:59:59 (Madrid time).',
    terms: 'Card required. New subscribers only, one trial per email. Then automatic renewal at your selected price unless you cancel before the 7 days end.',
    checkout: 'Start 7 free days',
    unavailable: 'The trial is no longer available for this signup. Review the price and accept the terms again to start a paid subscription.',
    expired: 'The offer ended before signup was completed. No subscription was created and no payment was taken. You can subscribe to Pro at the current prices.',
    trialActive: 'Your 7-day trial is active', trialUntil: 'Free trial ends',
    after: 'Then', cancel: 'Cancel before that date through Manage subscription to avoid the first charge.',
  },
} as const
