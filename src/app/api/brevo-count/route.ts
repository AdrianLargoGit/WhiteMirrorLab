import { NextResponse } from 'next/server'
import { BREVO_COUNT_FALLBACK } from '@/lib/brevo-count'
import { getBrevoListCount, type SubscribeSource } from '@/lib/brevo-subscribe'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit'

const toSource = (value: string | null): SubscribeSource => (
  value === 'tech' || value === 'social' ? value : 'general'
)

export async function GET(req: Request) {
  const clientIp = getClientIp(req)
  const rateLimit = checkRateLimit({
    key: `brevo-count:${clientIp}`,
    limit: 60,
    windowMs: 60 * 1000,
  })

  if (!rateLimit.ok) {
    return NextResponse.json(
      { count: BREVO_COUNT_FALLBACK },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    )
  }

  const { searchParams } = new URL(req.url)
  const source = toSource(searchParams.get('source'))

  try {
    const result = await getBrevoListCount(source)
    if (!result.ok) {
      return NextResponse.json({ count: result.count }, { status: result.status })
    }

    return NextResponse.json({ count: result.count }, { headers: rateLimitHeaders(rateLimit) })
  } catch (err) {
    console.error('Brevo count fetch error:', err)
    return NextResponse.json({ count: BREVO_COUNT_FALLBACK }, { status: 500 })
  }
}
