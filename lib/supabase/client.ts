'use client'

import { createBrowserClient } from '@supabase/ssr'
import { publicEnv } from '@/lib/env'
import type { Database } from '@/lib/database.types'

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createSupabaseBrowserClient() {
  if (!cached) {
    cached = createBrowserClient<Database>(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    )
  }
  return cached
}
