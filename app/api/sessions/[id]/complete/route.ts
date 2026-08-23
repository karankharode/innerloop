import { NextResponse, type NextRequest } from 'next/server'
import { completeSession, getOwnedSession } from '@/lib/sessions'
import { currentActor, handleRouteError, jsonError } from '@/lib/api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** POST /api/sessions/:id/complete — derive the summary and lock the run. */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const session = await getOwnedSession(id, await currentActor())
    if (!session) return jsonError('Session not found', 404)

    const completed = await completeSession(session)
    return NextResponse.json({ ok: true, summary: completed.summary })
  } catch (err) {
    return handleRouteError(err)
  }
}
