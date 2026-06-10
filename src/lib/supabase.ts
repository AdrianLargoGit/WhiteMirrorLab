'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_WML_1_0!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_WML_1_0!
  )
}

export const supabase = createClient()
