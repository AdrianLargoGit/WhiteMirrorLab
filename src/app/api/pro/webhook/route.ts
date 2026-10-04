import { NextResponse } from 'next/server'
import { proApiError } from '@/lib/proApi'
import { proEnv } from '@/lib/proConfig'
import { verifyProWebhook } from '@/lib/proWebhook'
import { deliverPaidProInvoice, proEventSubscription, reconcileProSubscription } from '@/lib/stripePro'

export const runtime = 'nodejs'
const EVENTS = new Set([
  'checkout.session.completed', 'checkout.session.async_payment_succeeded',
  'invoice.paid', 'invoice.payment_failed', 'invoice.payment_action_required',
  'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted',
  'charge.refunded', 'charge.dispute.created', 'charge.dispute.closed',
])

export async function POST(request: Request) {
  try {
    const raw = await request.text()
    if (raw.length > 1024 * 1024) return NextResponse.json({ error: 'event_too_large' }, { status: 413 })
    if (!verifyProWebhook(raw, request.headers.get('stripe-signature'), proEnv('WML_PRO_STRIPE_WEBHOOK_SECRET'))) {
      return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
    }
    const event = JSON.parse(raw) as { type: string; data: { object: Record<string, unknown> } }
    if (!event || typeof event.type !== 'string' || !event.data?.object || typeof event.data.object !== 'object' || Array.isArray(event.data.object)) {
      return NextResponse.json({ error: 'invalid_event' }, { status: 400 })
    }
    if (EVENTS.has(event.type)) {
      const subscriptionId = await proEventSubscription(event.type, event.data.object)
      if (subscriptionId) {
        await reconcileProSubscription(subscriptionId)
        if (event.type === 'invoice.paid' && typeof event.data.object.id === 'string') {
          await deliverPaidProInvoice(subscriptionId, event.data.object.id)
        }
      }
    }
    return NextResponse.json({ received: true })
  } catch (error) { return proApiError(error) }
}
