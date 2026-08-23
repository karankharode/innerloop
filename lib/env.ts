import { z } from 'zod'

/**
 * Fail loudly at boot rather than mysteriously at runtime. Vercel builds will
 * break here if a variable is missing, which is the point.
 *
 * Uses new API keys (`sb_publishable_…` / `sb_secret_…`), not legacy JWT
 * `anon` / `service_role` keys.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().startsWith('sb_publishable_'),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
})

const serverSchema = publicSchema.extend({
  SUPABASE_SECRET_KEY: z.string().startsWith('sb_secret_'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
})

// Next.js inlines NEXT_PUBLIC_* only when referenced statically, hence the
// explicit property access rather than a loop over process.env.
const rawPublic = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
}

export const publicEnv = publicSchema.parse(rawPublic)

let cachedServerEnv: z.infer<typeof serverSchema> | null = null

/** Server-only. Throws if called from a client bundle. */
export function serverEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv() must not be called in the browser')
  }
  if (!cachedServerEnv) {
    cachedServerEnv = serverSchema.parse({
      ...rawPublic,
      SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
      SESSION_SECRET: process.env.SESSION_SECRET,
    })
  }
  return cachedServerEnv
}

export const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
