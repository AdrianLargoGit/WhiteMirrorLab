import { NextRequest, NextResponse } from 'next/server'
import { getMarketplaceObject, marketplaceObjectToWebStream } from '@/lib/marketplaceStorage'
import { createMarketplaceSupabaseClient } from '@/lib/marketplaceSupabase'
import {
  isPaidMarketplaceSession,
  isStripeCheckoutSessionId,
  retrieveMarketplaceStripeCheckoutSession,
} from '@/lib/stripeMarketplace'

function safeZipName(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return `${slug || 'wml-creator-pack'}.zip`
}

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('product')?.trim()
  const sessionId = request.nextUrl.searchParams.get('session_id')?.trim()

  if (!productId || !sessionId) {
    return NextResponse.json({ error: 'Missing product or Stripe session id' }, { status: 400 })
  }

  if (!isStripeCheckoutSessionId(sessionId)) {
    return NextResponse.json({ error: 'Invalid Stripe session id' }, { status: 400 })
  }

  try {
    const supabase = createMarketplaceSupabaseClient({ useServiceRole: true })
    const { data: product, error } = await supabase
      .from('products')
      .select('id,title,price,status,download_blob_url,stripe_account_id')
      .eq('id', productId)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.status !== 'approved' || !product.download_blob_url) {
      return NextResponse.json({ error: 'Product download is not available' }, { status: 409 })
    }

    const session = await retrieveMarketplaceStripeCheckoutSession(sessionId)

    if (!isPaidMarketplaceSession(session, product)) {
      return NextResponse.json({ error: 'Payment could not be verified' }, { status: 403 })
    }

    const blobResult = await getMarketplaceObject(product.download_blob_url)

    if (!blobResult) {
      return NextResponse.json({ error: 'Download file not found' }, { status: 404 })
    }

    const headers = new Headers()
    headers.set('Content-Type', blobResult.contentType || 'application/zip')
    headers.set('Content-Disposition', `attachment; filename="${safeZipName(product.title)}"`)
    headers.set('Cache-Control', 'no-store')

    return new Response(marketplaceObjectToWebStream(blobResult), { headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to download product'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
