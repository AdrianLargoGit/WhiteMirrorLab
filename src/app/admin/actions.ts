'use server'

import { revalidatePath } from 'next/cache'
import { sendMarketplaceStatusEmail } from '@/lib/marketplaceEmail'
import { deleteMarketplaceObject } from '@/lib/marketplaceStorage'
import { createMarketplaceSupabaseClient } from '@/lib/marketplaceSupabase'
import { isMarketplaceAdmin } from '@/lib/marketplaceAdmin'
import { isFreeMarketplacePrice } from '@/lib/marketplacePricing'

async function requireAdminSession() {
  if (!await isMarketplaceAdmin()) throw new Error('Invalid admin session')
}

export async function approveProduct(formData: FormData) {
  await requireAdminSession()

  const productId = String(formData.get('productId') ?? '')

  if (!productId) {
    throw new Error('Missing product id')
  }

  const supabase = createMarketplaceSupabaseClient({ useServiceRole: true })
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    throw new Error(productError?.message ?? 'Product not found')
  }

  if (product.status !== 'pending') {
    throw new Error('Only pending products can be approved')
  }

  if (!product.blob_url) {
    throw new Error('Product has no temporary blob_url')
  }

  if (!isFreeMarketplacePrice(product.price) && !product.stripe_account_id) {
    throw new Error('Product has no Stripe Connect account id')
  }

  const { data: approved, error: updateError } = await supabase
    .from('products')
    .update({
      status: 'approved',
      blob_url: null,
      download_blob_url: product.blob_url,
    })
    .eq('id', product.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (!approved && !updateError) throw new Error('Product status has changed; reload the review')
  if (updateError) {
    throw new Error(updateError.message)
  }

  const emailResult = await sendMarketplaceStatusEmail({
    to: product.creator_email,
    productTitle: product.title,
    status: 'approved',
  })

  if (!emailResult.ok) {
    console.error('Marketplace approval email failed:', emailResult.error)
  }

  revalidatePath('/admin')
  revalidatePath('/marketplace')
}

export async function rejectProduct(formData: FormData) {
  await requireAdminSession()

  const productId = String(formData.get('productId') ?? '')

  if (!productId) {
    throw new Error('Missing product id')
  }

  const supabase = createMarketplaceSupabaseClient({ useServiceRole: true })
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    throw new Error(productError?.message ?? 'Product not found')
  }

  // Hide the product before removing assets; preserve their references if cleanup fails.
  const { data: rejected, error: rejectError } = await supabase
    .from('products')
    .update({ status: 'rejected', featured_rank: null })
    .eq('id', product.id)
    .eq('status', product.status)
    .select('id')
    .maybeSingle()
  if (rejectError || !rejected) throw new Error(rejectError?.message ?? 'Product status has changed; reload the review')
  revalidatePath('/admin')
  revalidatePath('/marketplace')
  revalidatePath(`/marketplace/${product.id}`)

  if (product.blob_url) {
    await deleteMarketplaceObject(product.blob_url)
  }
  if (product.download_blob_url) {
    await deleteMarketplaceObject(product.download_blob_url)
  }
  if (product.cover_image_url) {
    await deleteMarketplaceObject(product.cover_image_url)
  }
  await Promise.all((product.preview_image_urls ?? []).map((url) => deleteMarketplaceObject(url)))

  const { error: updateError } = await supabase
    .from('products')
    .update({
      status: 'rejected',
      blob_url: null,
      download_blob_url: null,
      cover_image_url: null,
      preview_image_urls: [],
    })
    .eq('id', product.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  const emailResult = await sendMarketplaceStatusEmail({
    to: product.creator_email,
    productTitle: product.title,
    status: 'rejected',
  })

  if (!emailResult.ok) {
    console.error('Marketplace rejection email failed:', emailResult.error)
  }

  revalidatePath('/admin')
}

export async function setFeaturedProduct(formData: FormData) {
  await requireAdminSession()

  const productId = String(formData.get('productId') ?? '')
  const rawRank = String(formData.get('featuredRank') ?? '')
  const featuredRank = rawRank ? Number(rawRank) : null

  if (!productId) {
    throw new Error('Missing product id')
  }

  if (featuredRank !== null && (!Number.isInteger(featuredRank) || featuredRank < 1 || featuredRank > 3)) {
    throw new Error('Featured rank must be 1, 2, or 3')
  }

  const supabase = createMarketplaceSupabaseClient({ useServiceRole: true })
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id,status')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    throw new Error(productError?.message ?? 'Product not found')
  }

  if (product.status !== 'approved') {
    throw new Error('Only approved products can be featured')
  }

  if (featuredRank !== null) {
    const { error: clearError } = await supabase
      .from('products')
      .update({ featured_rank: null })
      .eq('featured_rank', featuredRank)
      .neq('id', productId)

    if (clearError) {
      throw new Error(clearError.message)
    }
  }

  const { error: updateError } = await supabase
    .from('products')
    .update({ featured_rank: featuredRank })
    .eq('id', productId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidatePath('/admin')
  revalidatePath('/marketplace')
}
