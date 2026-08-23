import { NextResponse } from 'next/server'
import { MARKETPLACE_SUBMISSIONS_ARE_OPEN } from '@/lib/marketplaceAvailability'
import {
  formatServerError,
  type UploadRequestBody,
  validateMarketplaceUpload,
} from '@/lib/marketplaceUpload'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit'
import { createMarketplaceUploadUrl } from '@/lib/marketplaceStorage'

export async function POST(request: Request) {
  if (!MARKETPLACE_SUBMISSIONS_ARE_OPEN) {
    return NextResponse.json({ error: 'Marketplace uploads are not open yet' }, { status: 503 })
  }

  const clientIp = getClientIp(request)
  const rateLimit = checkRateLimit({
    key: `upload:${clientIp}`,
    limit: 24,
    windowMs: 60 * 60 * 1000,
  })

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Too many upload attempts. Try again later.' },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    )
  }

  let body: UploadRequestBody

  try {
    body = (await request.json()) as UploadRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const valid = validateMarketplaceUpload(body)

  if (!valid.ok) {
    return NextResponse.json({ error: valid.error }, { status: 422 })
  }

  try {
    const upload = await createMarketplaceUploadUrl(valid.pathname, valid.contentType)

    return NextResponse.json(upload, {
      headers: rateLimitHeaders(rateLimit),
    })
  } catch (error) {
    console.error('Marketplace upload signing error:', error)
    const message = formatServerError(error, 'Upload failed')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
