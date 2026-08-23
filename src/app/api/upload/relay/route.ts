import { NextRequest, NextResponse } from 'next/server'
import { MARKETPLACE_SUBMISSIONS_ARE_OPEN } from '@/lib/marketplaceAvailability'
import {
  formatServerError,
  validateMarketplaceUpload,
} from '@/lib/marketplaceUpload'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit'
import { uploadMarketplaceObjectStream } from '@/lib/marketplaceStorage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!MARKETPLACE_SUBMISSIONS_ARE_OPEN) {
    return NextResponse.json({ error: 'Marketplace uploads are not open yet' }, { status: 503 })
  }

  const clientIp = getClientIp(request)
  const rateLimit = checkRateLimit({
    key: `upload-relay:${clientIp}`,
    limit: 12,
    windowMs: 60 * 60 * 1000,
  })

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Too many upload attempts. Try again later.' },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    )
  }

  const valid = validateMarketplaceUpload({
    pathname: request.nextUrl.searchParams.get('pathname') ?? undefined,
    contentType: request.nextUrl.searchParams.get('contentType') ?? undefined,
    size: Number(request.nextUrl.searchParams.get('size')),
  })

  if (!valid.ok) {
    return NextResponse.json({ error: valid.error }, { status: 422 })
  }

  if (!request.body) {
    return NextResponse.json({ error: 'Missing upload body' }, { status: 400 })
  }

  try {
    const upload = await uploadMarketplaceObjectStream({
      path: valid.pathname,
      contentType: valid.contentType,
      body: request.body,
    })

    return NextResponse.json(upload, {
      headers: rateLimitHeaders(rateLimit),
    })
  } catch (error) {
    console.error('Marketplace relay upload error:', error)
    const message = formatServerError(error, 'Upload failed')
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
