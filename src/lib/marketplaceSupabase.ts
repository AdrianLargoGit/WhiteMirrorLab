import { createClient } from '@supabase/supabase-js'

export type MarketplaceProductStatus = 'pending' | 'approved' | 'rejected'

export type MarketplaceProduct = {
  id: string
  title: string
  description: string | null
  creator_name: string
  creator_email: string
  stripe_account_id: string | null
  price: number
  blob_url: string | null
  download_blob_url: string | null
  cover_image_url: string | null
  preview_image_urls: string[]
  pet_count: number
  clothes_count: number
  status: MarketplaceProductStatus
  created_at: string
  updated_at: string
}

type MarketplaceDatabase = {
  public: {
    Tables: {
      products: {
        Row: MarketplaceProduct
        Insert: {
          id?: string
          title: string
          description?: string | null
          creator_name: string
          creator_email: string
          stripe_account_id?: string | null
          price: number
          blob_url: string
          download_blob_url?: string | null
          cover_image_url?: string | null
          preview_image_urls?: string[]
          pet_count?: number
          clothes_count?: number
          status?: MarketplaceProductStatus
          created_at?: string
          updated_at?: string
        }
        Update: Partial<
          Pick<
            MarketplaceProduct,
            | 'title'
            | 'description'
            | 'creator_name'
            | 'creator_email'
            | 'stripe_account_id'
            | 'price'
            | 'blob_url'
            | 'download_blob_url'
            | 'cover_image_url'
            | 'preview_image_urls'
            | 'pet_count'
            | 'clothes_count'
            | 'status'
          >
        >
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

function getMarketplaceSupabaseConfig() {
  const url = process.env.MARKETPLACE_SUPABASE_URL
  const anonKey = process.env.MARKETPLACE_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.MARKETPLACE_SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('Missing MARKETPLACE_SUPABASE_URL')
  }

  if (!anonKey && !serviceRoleKey) {
    throw new Error(
      'Missing MARKETPLACE_SUPABASE_ANON_KEY or MARKETPLACE_SUPABASE_SERVICE_ROLE_KEY',
    )
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
  }
}

export function createMarketplaceSupabaseClient(options?: {
  useServiceRole?: boolean
}) {
  const { url, anonKey, serviceRoleKey } = getMarketplaceSupabaseConfig()
  const key = options?.useServiceRole ? serviceRoleKey ?? anonKey : anonKey ?? serviceRoleKey

  if (!key) {
    throw new Error('Missing marketplace Supabase key')
  }

  return createClient<MarketplaceDatabase>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
