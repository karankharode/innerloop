import { NextResponse, type NextRequest } from 'next/server'
import {
  deleteSession,
  getAnswers,
  getOwnedSession,
  getSessionQuestions,
} from '@/lib/sessions'
import { getCurrentUser } from '@/lib/supabase/server'
import { currentActor, handleRouteError, jsonError } from '@/lib/api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** DELETE /api/sessions/:id — remove a saved session and its answers. */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const user = await getCurrentUser()
    if (!user) return jsonError('Sign in first', 401)

    await deleteSession(id, user.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleRouteError(err)
  }
}

/**
 * GET /api/sessions/:id — resume a run after a refresh or a device switch
 * within the same browser. Owner-only; returns the questions plus whatever
 * has already been answered.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const session = await getOwnedSession(id, await currentActor())
    if (!session) return jsonError('Session not found', 404)

    const [questions, answers] = await Promise.all([
      getSessionQuestions(session),
      getAnswers(session.id),
    ])

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      questions: questions.map((q) => ({
        id: q.id,
        kind: q.kind,
        body: q.body,
        helperText: q.helper_text,
        config: q.config,
        theme: { slug: q.theme_slug, title: q.theme_title, accent: q.theme_accent },
      })),
      answers: answers.map((a) => ({
        questionId: a.question_id,
        text: a.value_text,
        number: a.value_number,
        skipped: a.skipped,
      })),
    })
  } catch (err) {
    return handleRouteError(err)
  }
}
