import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Return a dummy client during build time
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // During build/SSR, return null - components should handle this
      return null as any
    }
    throw new Error('Missing Supabase environment variables')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}