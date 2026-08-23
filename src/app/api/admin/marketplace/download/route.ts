import { NextRequest, NextResponse } from 'next/server'
import { getMarketplaceObject, marketplaceObjectToWebStream } from '@/lib/marketplaceStorage'
import { createMarketplaceSupabaseClient } from '@/lib/marketplaceSupabase'

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const productId = request.nextUrl.searchParams.get('product')

  if (!process.env.MARKETPLACE_ADMIN_TOKEN || token !== process.env.MARKETPLACE_ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!productId) {
    return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
  }

  const supabase = createMarketplaceSupabaseClient({ useServiceRole: true })
  const { data: product, error } = await supabase
    .from('products')
    .select('id,title,blob_url,status')
    .eq('id', productId)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  if (!product.blob_url) {
    return NextResponse.json({ error: 'ZIP not available' }, { status: 404 })
  }

  const blobResult = await getMarketplaceObject(product.blob_url)

  if (!blobResult) {
    return NextResponse.json({ error: 'ZIP not found' }, { status: 404 })
  }

  const fileName = `${safeFileName(product.title) || product.id}.zip`

  return new NextResponse(marketplaceObjectToWebStream(blobResult), {
    headers: {
      'Content-Type': blobResult.contentType || 'application/zip',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
