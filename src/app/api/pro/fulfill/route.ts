import { NextResponse } from 'next/server'
import { browserProPurchase, proApiError } from '@/lib/proApi'
import { PRO_PRIVATE_HEADERS, ProError } from '@/lib/proConfig'
import { ensurePaidProBrevoList } from '@/lib/stripePro'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const purchase = await browserProPurchase()
    // The receipt also confirms the purchase when a Stripe webhook is not configured.
    // A Brevo outage must never prevent access to a paid license.
    try {
      await ensurePaidProBrevoList(purchase)
    } catch (error) {
      console.error('WML Pro list sync failed:', error instanceof ProError ? error.code : 'unexpected_error')
    }
    let invoiceUrl: string | null = null
    try {
      const url = new URL(purchase.invoice.hosted_invoice_url ?? '')
      if (url.protocol === 'https:' && url.hostname === 'invoice.stripe.com') invoiceUrl = url.toString()
    } catch { /* Stripe did not provide a hosted invoice. */ }
    return NextResponse.json({
      ok: true, plan: purchase.plan,
      paidUntil: new Date(purchase.paidUntil * 1000).toISOString(),
      amountPaid: typeof purchase.invoice.amount_paid === 'number' ? purchase.invoice.amount_paid : null,
      invoiceId: purchase.invoice.id,
      invoiceUrl,
      licenseUrl: '/api/pro/license', installerUrl: '/api/pro/installer',
    }, { headers: PRO_PRIVATE_HEADERS })
  } catch (error) { return proApiError(error) }
}
