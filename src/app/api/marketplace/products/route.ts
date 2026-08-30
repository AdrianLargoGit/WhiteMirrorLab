import { NextResponse } from 'next/server'
import { MARKETPLACE_SUBMISSIONS_ARE_OPEN } from '@/lib/marketplaceAvailability'
import { getMinimumMarketplacePrice } from '@/lib/marketplacePricing'
import { deleteMarketplaceObject, getMarketplaceObjectBuffer, isMarketplaceStorageUrl } from '@/lib/marketplaceStorage'
import { createMarketplaceSupabaseClient } from '@/lib/marketplaceSupabase'
import { summarizeMarketplaceZip } from '@/lib/marketplaceZipSummary'
import { sendMarketplaceStatusEmail } from '@/lib/marketplaceEmail'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit'

type SubmitProductBody = {
  title?: string
  description?: string
  creator_name?: string
  email?: string
  stripe_account_id?: string
  price?: number
  blob_url?: string
  cover_image_url?: string
  preview_image_urls?: string[]
  pet_count?: number
  clothes_count?: number
  website?: string
  form_started_at?: number
}

function isValidCreatorEmail(email: string) {
  return (
    email.length <= 254 &&
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(email)
  )
}

function isValidStripeAccountId(value: string) {
  return /^acct_[A-Za-z0-9]+$/.test(value)
}

export async function POST(request: Request) {
  if (!MARKETPLACE_SUBMISSIONS_ARE_OPEN) {
    return NextResponse.json({ error: 'Marketplace submissions are not open yet' }, { status: 503 })
  }

  const clientIp = getClientIp(request)
  const rateLimit = checkRateLimit({
    key: `marketplace-products:${clientIp}`,
    limit: 8,
    windowMs: 60 * 60 * 1000,
  })

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Too many submissions. Try again later.' },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    )
  }

  let body: SubmitProductBody

  try {
    body = (await request.json()) as SubmitProductBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const title = body.title?.trim()
  const description = body.description?.trim()
  const creatorName = body.creator_name?.trim()
  const email = body.email?.trim().toLowerCase()
  const stripeAccountId = body.stripe_account_id?.trim()
  const price = Number(body.price)
  const minimumPrice = getMinimumMarketplacePrice()
  const blobUrl = body.blob_url?.trim()
  const coverImageUrl = body.cover_image_url?.trim()
  const previewImageUrls = Array.isArray(body.preview_image_urls)
    ? body.preview_image_urls.map((url) => url.trim()).filter(Boolean).slice(0, 6)
    : []
  const honeypot = body.website?.trim()
  const formStartedAt = Number(body.form_started_at)

  if (honeypot) {
    return NextResponse.json({ error: 'Invalid submission' }, { status: 422 })
  }

  if (
    !Number.isFinite(formStartedAt) ||
    Date.now() - formStartedAt < 2500 ||
    Date.now() - formStartedAt > 2 * 60 * 60 * 1000
  ) {
    return NextResponse.json({ error: 'Invalid form timing' }, { status: 422 })
  }

  if (!title || title.length > 140) {
    return NextResponse.json({ error: 'Title is required' }, { status: 422 })
  }

  if (!description || description.length < 40 || description.length > 1600) {
    return NextResponse.json(
      { error: 'Description must be between 40 and 1600 characters' },
      { status: 422 },
    )
  }

  if (!creatorName || creatorName.length > 80) {
    return NextResponse.json({ error: 'Creator name is required' }, { status: 422 })
  }

  if (!email || !isValidCreatorEmail(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 422 })
  }

  if (!stripeAccountId || !isValidStripeAccountId(stripeAccountId)) {
    return NextResponse.json({ error: 'Valid Stripe Connect account ID is required' }, { status: 422 })
  }

  if (!Number.isFinite(price) || price < minimumPrice) {
    return NextResponse.json(
      { error: `Price must be at least ${minimumPrice.toFixed(2)}` },
      { status: 422 },
    )
  }

  if (
    !blobUrl ||
    !isMarketplaceStorageUrl(blobUrl) ||
    !blobUrl.includes('marketplace-submissions/')
  ) {
    return NextResponse.json({ error: 'Valid blob_url is required' }, { status: 422 })
  }

  if (!blobUrl.toLowerCase().includes('.zip')) {
    return NextResponse.json({ error: 'Only .zip files are allowed' }, { status: 422 })
  }

  if (
    !coverImageUrl ||
    !isMarketplaceStorageUrl(coverImageUrl) ||
    !coverImageUrl.includes('marketplace-covers/')
  ) {
    return NextResponse.json({ error: 'Valid cover_image_url is required' }, { status: 422 })
  }

  if (
    previewImageUrls.some((url) => (
      !isMarketplaceStorageUrl(url) ||
      !url.includes('marketplace-previews/')
    ))
  ) {
    return NextResponse.json({ error: 'Valid preview image URLs are required' }, { status: 422 })
  }

  try {
    const zipObject = await getMarketplaceObjectBuffer(blobUrl)

    if (!zipObject) {
      return NextResponse.json({ error: 'ZIP file not found' }, { status: 422 })
    }

    const zipSummary = summarizeMarketplaceZip(zipObject.bytes)

    if (zipSummary.petCount > 1500 || zipSummary.clothesCount > 1500) {
      return NextResponse.json({ error: 'Invalid ZIP summary' }, { status: 422 })
    }

    const productId = crypto.randomUUID()
    const supabase = createMarketplaceSupabaseClient({ useServiceRole: true })
    const { error } = await supabase
      .from('products')
      .insert({
        id: productId,
        title,
        description,
        creator_name: creatorName,
        creator_email: email,
        stripe_account_id: stripeAccountId,
        price,
        blob_url: blobUrl,
        cover_image_url: coverImageUrl,
        preview_image_urls: previewImageUrls,
        pet_count: zipSummary.petCount,
        clothes_count: zipSummary.clothesCount,
        status: 'pending',
      })

    if (error) {
      await deleteMarketplaceObject(blobUrl)
      await deleteMarketplaceObject(coverImageUrl)
      await Promise.all(previewImageUrls.map((url) => deleteMarketplaceObject(url)))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const emailResult = await sendMarketplaceStatusEmail({
      to: email,
      productTitle: title,
      status: 'submitted',
    })

    if (!emailResult.ok) {
      console.error('Marketplace submission email failed:', emailResult.error)
    }

    return NextResponse.json(
      { ok: true, productId },
      { headers: rateLimitHeaders(rateLimit) },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create product'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
