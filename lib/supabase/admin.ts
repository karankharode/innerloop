import { createClient } from '@supabase/supabase-js'
import { serverEnv } from '@/lib/env'
import type { Database } from '@/lib/database.types'

/**
 * Secret-key client. Bypasses RLS — never import this into a client
 * component, and never hand its results straight to a caller without an
 * ownership check first.
 *
 * Used for: anonymous session writes (the visitor has no JWT), share-link
 * reads, and candidate logging.
 */
let cached: ReturnType<typeof createClient<Database>> | null = null

export function supabaseAdmin() {
  if (!cached) {
    const env = serverEnv()
    cached = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SECRET_KEY,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
    )
  }
  return cached
}
