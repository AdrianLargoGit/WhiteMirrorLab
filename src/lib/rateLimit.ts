type Bucket = {
  count: number
  resetAt: number
}

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

const buckets = new Map<string, Bucket>()

function cleanup(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const vercelIp = request.headers.get('x-vercel-forwarded-for')

  return (
    vercelIp?.split(',')[0]?.trim() ||
    forwardedFor?.split(',')[0]?.trim() ||
    realIp?.trim() ||
    'unknown'
  )
}

export function checkRateLimit(options: RateLimitOptions) {
  const now = Date.now()
  cleanup(now)

  const bucket = buckets.get(options.key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    })

    return {
      ok: true,
      remaining: options.limit - 1,
      resetAt: now + options.windowMs,
    }
  }

  if (bucket.count >= options.limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: bucket.resetAt,
    }
  }

  bucket.count += 1

  return {
    ok: true,
    remaining: options.limit - bucket.count,
    resetAt: bucket.resetAt,
  }
}

export function rateLimitHeaders(result: { remaining: number; resetAt: number }) {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  }
}

