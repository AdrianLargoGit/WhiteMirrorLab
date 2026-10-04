import { browserProPurchase, proApiError } from '@/lib/proApi'
import { PRO_PRIVATE_HEADERS } from '@/lib/proConfig'
import { makeProLicense } from '@/lib/proLicense'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const { subscription, plan, paidUntil } = await browserProPurchase()
    const license = makeProLicense({ subscriptionId: subscription.id, plan, issuedAt: subscription.created, paidUntil })
    return new Response(`${JSON.stringify(license, null, 2)}\n`, { headers: {
      ...PRO_PRIVATE_HEADERS,
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="pro-license.json"',
      'X-Content-Type-Options': 'nosniff',
    } })
  } catch (error) { return proApiError(error) }
}
