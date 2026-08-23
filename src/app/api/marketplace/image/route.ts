import { NextRequest, NextResponse } from 'next/server'
import { getMarketplaceObjectBuffer } from '@/lib/marketplaceStorage'
import { createMarketplaceSupabaseClient } from '@/lib/marketplaceSupabase'

const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const IMAGE_TYPES_BY_EXTENSION: Record<string, string> = {
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

function inferImageContentType(imageUrl: string) {
  const extension = imageUrl
    .split('?')[0]
    .split('#')[0]
    .split('.')
    .pop()
    ?.toLowerCase()

  return extension ? IMAGE_TYPES_BY_EXTENSION[extension] : undefined
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function toBase64(bytes: Uint8Array) {
  let binary = ''
  const chunkSize = 0x8000

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize))
  }

  return btoa(binary)
}

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('product')
  const kind = request.nextUrl.searchParams.get('kind') ?? 'cover'
  const index = Number(request.nextUrl.searchParams.get('index') ?? 0)
  const token = request.nextUrl.searchParams.get('token')

  if (!productId) {
    return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
  }

  const supabase = createMarketplaceSupabaseClient({ useServiceRole: true })
  const { data: product, error } = await supabase
    .from('products')
    .select('id,title,status,cover_image_url,preview_image_urls')
    .eq('id', productId)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const isAdmin = Boolean(process.env.MARKETPLACE_ADMIN_TOKEN && token === process.env.MARKETPLACE_ADMIN_TOKEN)
  if (product.status !== 'approved' && !isAdmin) {
    return NextResponse.json({ error: 'Image not available' }, { status: 404 })
  }

  const imageUrl = kind === 'preview'
    ? product.preview_image_urls?.[Number.isFinite(index) ? index : 0]
    : product.cover_image_url

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  const blobResult = await getMarketplaceObjectBuffer(imageUrl)

  if (!blobResult) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  const contentType = blobResult.contentType || inferImageContentType(imageUrl) || 'image/png'
  if (!SUPPORTED_IMAGE_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 415 })
  }

  const imageBytes = blobResult.bytes
  const imageBase64 = toBase64(imageBytes)
  const watermark = escapeXml('WHITE MIRROR LAB')
  const title = escapeXml(product.title)

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <pattern id="wm" width="320" height="180" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
      <text x="0" y="96" fill="rgba(255,255,255,0.42)" font-family="Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="5">${watermark}</text>
    </pattern>
  </defs>
  <rect width="1200" height="900" fill="#17120f"/>
  <image href="data:${contentType};base64,${imageBase64}" x="0" y="0" width="1200" height="900" preserveAspectRatio="xMidYMid slice"/>
  <rect width="1200" height="900" fill="url(#wm)"/>
  <rect y="804" width="1200" height="96" fill="rgba(8,8,8,0.68)"/>
  <text x="42" y="862" fill="#f5f2ee" font-family="Arial, sans-serif" font-size="34" font-weight="700">${title}</text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  })
}
