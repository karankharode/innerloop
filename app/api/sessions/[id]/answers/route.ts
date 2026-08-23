import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getOwnedSession, saveAnswer } from '@/lib/sessions'
import { currentActor, handleRouteError, jsonError } from '@/lib/api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z
  .object({
    questionId: z.string().uuid(),
    text: z.string().max(5000).optional().nullable(),
    number: z.number().finite().optional().nullable(),
    skipped: z.boolean().default(false),
  })
  .refine((v) => v.skipped || v.text?.trim() || v.number != null, {
    message: 'Write something, or skip the question',
  })

/** POST /api/sessions/:id/answers — save or update one answer. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Invalid answer', 400)
    }

    const session = await getOwnedSession(id, await currentActor())
    if (!session) return jsonError('Session not found', 404)

    await saveAnswer(session, parsed.data)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleRouteError(err)
  }
}
