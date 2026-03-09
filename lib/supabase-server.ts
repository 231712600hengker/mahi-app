import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Server-side Supabase client (use in Server Components and Server Actions only)
export const createServerSupabase = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies can't be set, ignore
          }
        },
      },
    }
  )
}
