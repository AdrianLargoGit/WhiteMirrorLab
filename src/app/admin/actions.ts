'use server'

import { revalidatePath } from 'next/cache'
import { sendMarketplaceStatusEmail } from '@/lib/marketplaceEmail'
import { deleteMarketplaceObject } from '@/lib/marketplaceStorage'
import { createMarketplaceSupabaseClient } from '@/lib/marketplaceSupabase'
import { isFreeMarketplacePrice } from '@/lib/marketplacePricing'

function requireAdminToken(formData: FormData) {
  const expectedToken = process.env.MARKETPLACE_ADMIN_TOKEN
  const submittedToken = String(formData.get('adminToken') ?? '')

  if (!expectedToken) {
    throw new Error('Missing MARKETPLACE_ADMIN_TOKEN')
  }

  if (submittedToken !== expectedToken) {
    throw new Error('Invalid admin token')
  }
}

export async function approveProduct(formData: FormData) {
  requireAdminToken(formData)

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

  const { error: updateError } = await supabase
    .from('products')
    .update({
      status: 'approved',
      blob_url: null,
      download_blob_url: product.blob_url,
    })
    .eq('id', product.id)

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
  requireAdminToken(formData)

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
