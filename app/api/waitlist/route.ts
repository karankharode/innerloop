import { z } from 'zod'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleRouteError, jsonError } from '@/lib/api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  email: z.string().trim().email().transform((e) => e.toLowerCase()),
  source: z.string().max(40).optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return jsonError('Enter a valid email address.', 400)
    }

    const { email, source } = parsed.data
    const db = supabaseAdmin()
    const { error } = await db.from('waitlist').insert({
      email,
      source: source ?? 'unknown',
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, already: true })
      }
      console.error('[waitlist] insert failed', error)
      return jsonError('Could not save that email. Try again in a moment.', 500)
    }

    return NextResponse.json({ ok: true, already: false })
  } catch (err) {
    return handleRouteError(err)
  }
}
