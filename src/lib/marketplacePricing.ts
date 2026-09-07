const DEFAULT_MARKETPLACE_CURRENCY = 'EUR'
const DEFAULT_MINIMUM_MARKETPLACE_PRICE = 2.99
const DEFAULT_PLATFORM_FEE_PERCENT = 20
const DEFAULT_MINIMUM_PLATFORM_FEE_CENTS = 100

function readNumber(value: string | undefined) {
  if (!value) return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function readBoolean(value: string | undefined) {
  return value === 'true'
}

export function getMarketplacePaidProductsEnabled() {
  return readBoolean(process.env.NEXT_PUBLIC_MARKETPLACE_PAID_PRODUCTS_ENABLED) ||
    readBoolean(process.env.MARKETPLACE_PAID_PRODUCTS_ENABLED)
}

export function getMarketplaceCurrency() {
  return (
    process.env.NEXT_PUBLIC_STRIPE_MARKETPLACE_CURRENCY ||
    process.env.STRIPE_MARKETPLACE_CURRENCY ||
    DEFAULT_MARKETPLACE_CURRENCY
  )
}

export function getMinimumMarketplacePrice() {
  return (
    readNumber(process.env.NEXT_PUBLIC_STRIPE_MARKETPLACE_MIN_PRICE) ??
    readNumber(process.env.STRIPE_MARKETPLACE_MIN_PRICE) ??
    DEFAULT_MINIMUM_MARKETPLACE_PRICE
  )
}

export function isFreeMarketplacePrice(price: number | string) {
  const parsed = typeof price === 'string' ? Number(price) : price

  return Number.isFinite(parsed) && parsed <= 0
}

export function toMinorCurrencyUnit(price: number) {
  return Math.round(price * 100)
}

export function getMarketplacePlatformFeeCents(price: number) {
  const percent = readNumber(process.env.STRIPE_MARKETPLACE_PLATFORM_FEE_PERCENT) ??
    DEFAULT_PLATFORM_FEE_PERCENT
  const minimumFeeCents = Math.round(
    readNumber(process.env.STRIPE_MARKETPLACE_MIN_PLATFORM_FEE_CENTS) ??
    DEFAULT_MINIMUM_PLATFORM_FEE_CENTS,
  )
  const percentageFeeCents = Math.round(toMinorCurrencyUnit(price) * (percent / 100))

  return Math.min(toMinorCurrencyUnit(price), Math.max(minimumFeeCents, percentageFeeCents))
}
