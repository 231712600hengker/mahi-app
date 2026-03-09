import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client (use in 'use client' components)
export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
  return createBrowserClient(url, key)
}
