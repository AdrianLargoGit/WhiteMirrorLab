const ALLOWED_PREFIXES = [
  'marketplace-submissions/',
  'marketplace-covers/',
  'marketplace-previews/',
]

const ALLOWED_ORIGINS = new Set([
  'https://whitemirrorlab.com',
  'https://www.whitemirrorlab.com',
  'http://localhost:3000',
  'http://localhost:3001',
])

function corsHeaders(request) {
  const origin = request.headers.get('Origin')
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://whitemirrorlab.com'

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'PUT, GET, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-wml-upload-secret',
    'Access-Control-Max-Age': '3600',
    Vary: 'Origin',
  }
}

function response(message, status, request) {
  return new Response(message, {
    status,
    headers: corsHeaders(request),
  })
}

function objectKeyFromRequest(request) {
  const url = new URL(request.url)
  const prefix = '/object/'

  if (!url.pathname.startsWith(prefix)) return null

  const key = decodeURIComponent(url.pathname.slice(prefix.length))

  if (
    !key ||
    key.includes('..') ||
    key.includes('\\') ||
    !ALLOWED_PREFIXES.some((allowedPrefix) => key.startsWith(allowedPrefix))
  ) {
    return null
  }

  return key
}

function hexToBytes(hex) {
  if (!/^[a-f0-9]{64}$/i.test(hex)) return null

  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16)
  }

  return bytes
}

function timingSafeEqual(left, right) {
  const leftBytes = hexToBytes(left)
  const rightBytes = hexToBytes(right)

  if (!leftBytes || !rightBytes || leftBytes.length !== rightBytes.length) {
    return false
  }

  let diff = 0
  for (let index = 0; index < leftBytes.length; index += 1) {
    diff |= leftBytes[index] ^ rightBytes[index]
  }

  return diff === 0
}

async function hmacHex(secret, value) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value))

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function hasValidSignedUploadUrl(request, env, key) {
  const url = new URL(request.url)
  const expiresAt = Number(url.searchParams.get('expires'))
  const signature = url.searchParams.get('signature') || ''

  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false
  }

  const expectedSignature = await hmacHex(
    String(env.WML_UPLOAD_SECRET || '').trim(),
    `${request.method.toUpperCase()}\n${key}\n${expiresAt}`,
  )

  return timingSafeEqual(signature, expectedSignature)
}

function hasValidSharedSecret(request, env) {
  const bearer = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  const receivedSecret = String(request.headers.get('x-wml-upload-secret') || bearer || '').trim()
  const expectedSecret = String(env.WML_UPLOAD_SECRET || '').trim()

  return Boolean(expectedSecret) && receivedSecret === expectedSecret
}

const worker = {
  async fetch(request, env) {
    const cors = corsHeaders(request)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    if (!env.WML_UPLOAD_SECRET) {
      return response('Missing Worker secret WML_UPLOAD_SECRET', 500, request)
    }

    if (new URL(request.url).pathname === '/') {
      return Response.json({ ok: true, service: 'wml-r2-upload-worker' }, { headers: cors })
    }

    const key = objectKeyFromRequest(request)

    if (!key) {
      return response('Invalid object key', 400, request)
    }

    const allowedBySecret = hasValidSharedSecret(request, env)
    const allowedBySignedUrl = request.method === 'PUT' &&
      await hasValidSignedUploadUrl(request, env, key)

    if (!allowedBySecret && !allowedBySignedUrl) {
      return response('Unauthorized', 401, request)
    }

    if (request.method === 'PUT') {
      await env.MARKETPLACE_BUCKET.put(key, request.body, {
        httpMetadata: {
          contentType: request.headers.get('Content-Type') || 'application/octet-stream',
        },
      })

      return Response.json({ ok: true, key }, { headers: cors })
    }

    if (request.method === 'GET') {
      const object = await env.MARKETPLACE_BUCKET.get(key)

      if (!object) {
        return response('Not found', 404, request)
      }

      const headers = new Headers(cors)
      object.writeHttpMetadata(headers)
      headers.set('etag', object.httpEtag)
      headers.set('Cache-Control', 'private, no-store')

      return new Response(object.body, { headers })
    }

    if (request.method === 'DELETE') {
      await env.MARKETPLACE_BUCKET.delete(key)

      return Response.json({ ok: true }, { headers: cors })
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: {
        ...cors,
        Allow: 'PUT, GET, DELETE',
      },
    })
  },
}

export default worker
