import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { readAnonToken, clearAnonToken } from '@/lib/anon-session'
import { claimAnonSessions } from '@/lib/sessions'
import { siteUrl } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Magic-link landing. Exchanges the code for a session, then adopts every
 * anonymous run this browser owns — this is the "save my results" moment.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const rawNext = url.searchParams.get('next') ?? '/history'
  // Only ever redirect to our own paths.
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/history'

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login?error=missing_code`)
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('[auth] code exchange failed', error)
    return NextResponse.redirect(`${siteUrl}/login?error=link_expired`)
  }

  try {
    const anonToken = await readAnonToken()
    if (anonToken) {
      const claimed = await claimAnonSessions(data.user.id, anonToken)
      if (claimed > 0) await clearAnonToken()
    }
  } catch (err) {
    // Claiming is best-effort — never block a successful sign-in on it.
    console.error('[auth] claiming anonymous sessions failed', err)
  }

  return NextResponse.redirect(`${siteUrl}${next}`)
}
