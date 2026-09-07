import { NextRequest, NextResponse } from 'next/server'
import { MARKETPLACE_IS_AVAILABLE } from '@/lib/marketplaceAvailability'
import { isFreeMarketplacePrice } from '@/lib/marketplacePricing'
import { createMarketplaceSupabaseClient } from '@/lib/marketplaceSupabase'
import { createMarketplaceStripeCheckout } from '@/lib/stripeMarketplace'

function getProductUrl(origin: string, productId: string, errorCode?: string) {
  const productUrl = new URL(`/marketplace/${productId}`, origin)

  if (errorCode) {
    productUrl.searchParams.set('payment_error', errorCode)
  }

  return productUrl
}

function isCreatorPayoutCapabilityError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  return message.includes('insufficient_capabilities_for_transfer')
    || message.includes('Your destination account needs to have')
}

export async function GET(request: NextRequest) {
  if (!MARKETPLACE_IS_AVAILABLE) {
    return NextResponse.json({ error: 'Marketplace is not available yet' }, { status: 503 })
  }

  const productId = request.nextUrl.searchParams.get('product')

  if (!productId) {
    return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
  }

  try {
    const supabase = createMarketplaceSupabaseClient({ useServiceRole: true })
    const { data: product, error } = await supabase
      .from('products')
      .select('id,title,description,creator_email,price,status,download_blob_url,stripe_account_id')
      .eq('id', productId)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.status !== 'approved' || !product.download_blob_url) {
      return NextResponse.json({ error: 'Product is not available for purchase' }, { status: 409 })
    }

    if (isFreeMarketplacePrice(product.price)) {
      const downloadUrl = new URL('/api/marketplace/download', request.nextUrl.origin)
      downloadUrl.searchParams.set('product', product.id)
      return NextResponse.redirect(downloadUrl, 303)
    }

    if (!product.stripe_account_id) {
      return NextResponse.json({ error: 'Product is not available for purchase' }, { status: 409 })
    }

    const checkout = await createMarketplaceStripeCheckout({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      creatorEmail: product.creator_email,
      stripeAccountId: product.stripe_account_id,
      origin: request.nextUrl.origin,
    })

    if (!checkout.url) {
      return NextResponse.json({ error: 'Stripe checkout URL missing' }, { status: 502 })
    }

    return NextResponse.redirect(checkout.url, 303)
  } catch (error) {
    if (isCreatorPayoutCapabilityError(error)) {
      return NextResponse.redirect(getProductUrl(request.nextUrl.origin, productId, 'creator_payouts_unavailable'), 303)
    }

    const message = error instanceof Error ? error.message : 'Unable to open checkout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
