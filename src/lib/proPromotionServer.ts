import { isProPromotionDate, PRO_TRIAL_CAMPAIGN, PRO_TRIAL_END } from './proPromotion'

export function proPromotionAvailable(now = Date.now()) {
  // Trials need the signed completion webhook to enforce the deadline even on
  // Stripe pages left open overnight. Fail closed until it is configured.
  return process.env.WML_PRO_TRIAL_ENABLED?.trim() !== 'false' &&
    Boolean(process.env.WML_PRO_STRIPE_WEBHOOK_SECRET?.trim()) && isProPromotionDate(now)
}

export function proPromotionStatus(now = Date.now()) {
  return { active: proPromotionAvailable(now), campaign: PRO_TRIAL_CAMPAIGN, endsAt: PRO_TRIAL_END, serverNow: now }
}
