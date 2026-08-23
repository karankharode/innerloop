import { NextResponse } from 'next/server'
import { ensureAnonToken } from '@/lib/anon-session'
import { getCurrentUser } from '@/lib/supabase/server'
import { createSession } from '@/lib/sessions'
import { handleRouteError } from '@/lib/api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** POST /api/sessions — start a run. No account required. */
export async function POST() {
  try {
    const user = await getCurrentUser()
    // Anonymous visitors get a signed cookie so they can own this run.
    const anonToken = user ? null : await ensureAnonToken()

    const { session, questions } = await createSession({
      userId: user?.id ?? null,
      anonToken,
    })

    return NextResponse.json({
      sessionId: session.id,
      questions: questions.map((q) => ({
        id: q.id,
        kind: q.kind,
        body: q.body,
        helperText: q.helper_text,
        config: q.config,
        theme: { slug: q.theme_slug, title: q.theme_title, accent: q.theme_accent },
      })),
    })
  } catch (err) {
    return handleRouteError(err)
  }
}
