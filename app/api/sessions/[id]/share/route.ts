import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { setSessionVisibility } from '@/lib/sessions'
import { getCurrentUser } from '@/lib/supabase/server'
import { handleRouteError, jsonError } from '@/lib/api'
import { siteUrl } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({ isPublic: z.boolean() })

/** POST /api/sessions/:id/share — toggle the public read-only link. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const user = await getCurrentUser()
    if (!user) return jsonError('Sign in to share your results', 401)

    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) return jsonError('Invalid request', 400)

    const session = await setSessionVisibility(id, user.id, parsed.data.isPublic)
    return NextResponse.json({
      isPublic: session.is_public,
      shareUrl: session.share_slug ? `${siteUrl}/s/${session.share_slug}` : null,
    })
  } catch (err) {
    return handleRouteError(err)
  }
}
