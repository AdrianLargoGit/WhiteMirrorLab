import { createBrowserClient } from '@supabase/ssr'
import { createClient as createIsomorphicClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_WML_1_0!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_WML_1_0!

export function createClient() {
  // 1. Si estamos en el navegador, usamos el cliente de SSR (mantiene cookies y sesión)
  if (typeof window !== 'undefined') {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  
  // 2. Si estamos en el servidor (como en tu generateMetadata), usamos el cliente estándar
  return createIsomorphicClient(supabaseUrl, supabaseAnonKey)
}

// Esta es la instancia limpia que importará tu archivo `queries.ts`
export const supabase = createClient()