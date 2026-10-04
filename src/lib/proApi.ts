import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PRO_CHECKOUT_COOKIE, PRO_PRIVATE_HEADERS, PRO_SESSION_COOKIE, ProError } from './proConfig'
import { ownedProCheckout, paidProEntitlement, requirePaidCheckout, retrieveProSubscription } from './stripePro'

export async function browserProPurchase() {
  const jar = await cookies()
  const session = await ownedProCheckout(jar.get(PRO_SESSION_COOKIE)?.value ?? '', jar.get(PRO_CHECKOUT_COOKIE)?.value)
  requirePaidCheckout(session)
  const entitlement = await paidProEntitlement(await retrieveProSubscription(session.subscription!))
  if (entitlement.subscription.customer !== session.customer) throw new ProError('checkout_not_owned', 401)
  return { session, ...entitlement }
}

export function proApiError(error: unknown) {
  const known = error instanceof ProError
  if (!known || error.status >= 500) console.error('WML Pro service failed:', known ? error.code : 'unexpected_error')
  return NextResponse.json({ ok: false, error: known ? error.code : 'pro_unavailable' }, {
    status: known ? error.status : 503, headers: PRO_PRIVATE_HEADERS,
  })
}
