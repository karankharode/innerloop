import { type NextRequest } from 'next/server'
import { getOwnedSession } from '@/lib/sessions'
import { currentActor, jsonError } from '@/lib/api'
import { renderCard } from '@/lib/card'
import { accentForTheme } from '@/lib/theme-accent'
import { getCurrentUser } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/card/:sessionId — the downloadable share card.
 *
 * Requires a signed-in owner: the card is one of the two things an account
 * unlocks (the public link being the other).
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await ctx.params

  const user = await getCurrentUser()
  if (!user) return jsonError('Sign in to download your card', 401)

  const session = await getOwnedSession(sessionId, await currentActor())
  if (!session || !session.summary) return jsonError('Session not found', 404)

  const dateLabel = session.completed_at
    ? new Date(session.completed_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : undefined

  const image = renderCard(session.summary, {
    accent: accentForTheme(session.summary.dominant_theme?.slug),
    dateLabel,
  })

  const download = req.nextUrl.searchParams.get('download') === '1'
  const headers = new Headers(image.headers)
  headers.set('Cache-Control', 'private, max-age=0, must-revalidate')
  if (download) {
    headers.set('Content-Disposition', `attachment; filename="innerloop-${sessionId.slice(0, 8)}.png"`)
  }

  return new Response(image.body, { status: image.status, headers })
}
