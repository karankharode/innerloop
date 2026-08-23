import 'server-only'
import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto'
import { cookies } from 'next/headers'
import { serverEnv } from '@/lib/env'

const COOKIE_NAME = 'il_anon'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180 // 180 days

/**
 * Anonymous ownership without an account.
 *
 * The visitor holds a random token in an HttpOnly, HMAC-signed cookie. The
 * database only ever stores sha256(token). Knowing the session UUID is not
 * enough to read or write it — you need the token too, which never leaves
 * the cookie.
 */

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function sign(value: string) {
  return createHmac('sha256', serverEnv().SESSION_SECRET).update(value).digest('base64url')
}

function serialize(token: string) {
  return `${token}.${sign(token)}`
}

function deserialize(raw: string | undefined): string | null {
  if (!raw) return null
  const idx = raw.lastIndexOf('.')
  if (idx <= 0) return null
  const token = raw.slice(0, idx)
  const provided = raw.slice(idx + 1)
  const expected = sign(token)
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return null
  return timingSafeEqual(a, b) ? token : null
}

/** Reads the visitor's anon token, if they have a valid one. */
export async function readAnonToken(): Promise<string | null> {
  const store = await cookies()
  return deserialize(store.get(COOKIE_NAME)?.value)
}

/**
 * Reads the existing token or mints a new one. Only callable from a Route
 * Handler or Server Action — Server Components cannot set cookies.
 */
export async function ensureAnonToken(): Promise<string> {
  const store = await cookies()
  const existing = deserialize(store.get(COOKIE_NAME)?.value)
  if (existing) return existing

  const token = randomBytes(32).toString('base64url')
  store.set(COOKIE_NAME, serialize(token), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
  return token
}

export async function clearAnonToken() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
