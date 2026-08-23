import 'server-only'
import { NextResponse } from 'next/server'
import { SessionError } from '@/lib/sessions'
import { readAnonToken } from '@/lib/anon-session'
import { getCurrentUser } from '@/lib/supabase/server'
import type { Actor } from '@/lib/sessions'

export async function currentActor(): Promise<Actor> {
  const [user, anonToken] = await Promise.all([getCurrentUser(), readAnonToken()])
  return { userId: user?.id ?? null, anonToken }
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Turns thrown errors into a clean response. Real details go to the server
 * log; the client gets something safe to display.
 */
export function handleRouteError(err: unknown) {
  if (err instanceof SessionError) {
    return jsonError(err.message, err.status)
  }
  console.error('[api] unhandled error', err)
  return jsonError('Something went wrong on our side. Please try again.', 500)
}
