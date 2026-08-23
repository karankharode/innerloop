import 'server-only'
import { randomBytes } from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { hashToken } from '@/lib/anon-session'
import { loadBank, selectQuestions, QUESTIONS_PER_SESSION } from '@/lib/engine'
import { buildSummary } from '@/lib/summary'
import { logCandidatesForSession } from '@/lib/candidates'
import type { AnswerRow, EngineQuestionSnapshot, SessionRow } from '@/lib/session-types'
import type { EngineQuestion } from '@/lib/engine'

export class SessionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'SessionError'
  }
}

export interface Actor {
  userId: string | null
  anonToken: string | null
}

function slug() {
  return randomBytes(9).toString('base64url') // 12 url-safe chars
}

function snapshot(q: EngineQuestion): EngineQuestionSnapshot {
  return {
    body: q.body,
    kind: q.kind,
    theme_slug: q.theme_slug,
    theme_title: q.theme_title,
    helper_text: q.helper_text,
    config: q.config,
  }
}

/** Creates a run and picks its questions. Works with or without an account. */
export async function createSession(actor: Actor): Promise<{ session: SessionRow; questions: EngineQuestion[] }> {
  if (!actor.userId && !actor.anonToken) {
    throw new SessionError('No session identity available', 400)
  }

  const db = supabaseAdmin()
  const { questions: bank } = await loadBank()

  // Rule 3 input: what this person has already been asked recently.
  const recentlySeen = new Set<string>()
  if (actor.userId) {
    const { data: recent } = await db
      .from('sessions')
      .select('question_ids')
      .eq('user_id', actor.userId)
      .order('started_at', { ascending: false })
      .limit(3)
    recent?.forEach((s) => s.question_ids?.forEach((id) => recentlySeen.add(id)))
  }

  const seed = randomBytes(8).toString('hex')
  const picked = selectQuestions(bank, { seed, recentlySeen, count: QUESTIONS_PER_SESSION })

  const { data, error } = await db
    .from('sessions')
    .insert({
      user_id: actor.userId,
      anon_token_hash: actor.userId ? null : hashToken(actor.anonToken!),
      question_ids: picked.map((q) => q.id),
      status: 'in_progress',
    })
    .select('*')
    .single()

  if (error || !data) throw new SessionError(`Could not start a session: ${error?.message}`, 500)
  return { session: data as SessionRow, questions: picked }
}

/** Loads a session only if the caller owns it. Returns null when they don't. */
export async function getOwnedSession(sessionId: string, actor: Actor): Promise<SessionRow | null> {
  const db = supabaseAdmin()
  const { data } = await db.from('sessions').select('*').eq('id', sessionId).maybeSingle()
  if (!data) return null

  const session = data as SessionRow
  if (session.user_id) {
    return actor.userId && session.user_id === actor.userId ? session : null
  }
  if (session.anon_token_hash && actor.anonToken) {
    return session.anon_token_hash === hashToken(actor.anonToken) ? session : null
  }
  return null
}

export async function getSessionQuestions(session: SessionRow): Promise<EngineQuestion[]> {
  const { questions } = await loadBank()
  const byId = new Map(questions.map((q) => [q.id, q]))
  return session.question_ids.map((id) => byId.get(id)).filter((q): q is EngineQuestion => Boolean(q))
}

export async function getAnswers(sessionId: string): Promise<AnswerRow[]> {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('answers')
    .select('*')
    .eq('session_id', sessionId)
    .order('sort_index')
  if (error) throw new SessionError(`Could not load answers: ${error.message}`, 500)
  return (data ?? []) as AnswerRow[]
}

export async function saveAnswer(
  session: SessionRow,
  input: { questionId: string; text?: string | null; number?: number | null; skipped: boolean },
): Promise<void> {
  if (session.status === 'completed') {
    throw new SessionError('This session is already complete', 409)
  }
  const sortIndex = session.question_ids.indexOf(input.questionId)
  if (sortIndex < 0) throw new SessionError('That question is not part of this session', 400)

  const questions = await getSessionQuestions(session)
  const question = questions.find((q) => q.id === input.questionId)
  if (!question) throw new SessionError('Question not found', 404)

  const db = supabaseAdmin()
  const { error } = await db.from('answers').upsert(
    {
      session_id: session.id,
      question_id: question.id,
      question_snapshot: snapshot(question) as never,
      sort_index: sortIndex,
      value_text: input.skipped ? null : (input.text?.trim() || null),
      value_number: input.skipped ? null : (input.number ?? null),
      skipped: input.skipped,
      answered_at: new Date().toISOString(),
    },
    { onConflict: 'session_id,question_id' },
  )
  if (error) throw new SessionError(`Could not save that answer: ${error.message}`, 500)
}

/** Marks the run complete and derives the summary. Idempotent. */
export async function completeSession(session: SessionRow): Promise<SessionRow> {
  const db = supabaseAdmin()
  const answers = await getAnswers(session.id)
  if (answers.length === 0) throw new SessionError('Answer at least one question first', 400)

  const summary = buildSummary(answers)

  const { data, error } = await db
    .from('sessions')
    .update({
      status: 'completed',
      summary: summary as never,
      completed_at: session.completed_at ?? new Date().toISOString(),
    })
    .eq('id', session.id)
    .select('*')
    .single()

  if (error || !data) throw new SessionError(`Could not finish the session: ${error?.message}`, 500)

  // Fire-and-forget: candidate logging must never fail a user's session.
  logCandidatesForSession(answers, summary).catch((err) =>
    console.error('[candidates] logging failed', err),
  )

  return data as SessionRow
}

/**
 * Attaches every anonymous session held by this browser to the account that
 * just signed in, and gives each a share slug.
 */
export async function claimAnonSessions(userId: string, anonToken: string): Promise<number> {
  const db = supabaseAdmin()
  const hash = hashToken(anonToken)

  const { data: owned } = await db
    .from('sessions')
    .select('id, share_slug')
    .eq('anon_token_hash', hash)
    .is('user_id', null)

  if (!owned?.length) return 0

  let claimed = 0
  for (const row of owned) {
    const { error } = await db
      .from('sessions')
      .update({
        user_id: userId,
        anon_token_hash: null,
        claimed_at: new Date().toISOString(),
        share_slug: row.share_slug ?? slug(),
      })
      .eq('id', row.id)
      .is('user_id', null)
    if (!error) claimed++
  }
  return claimed
}

/** Turns the public link on or off. Requires a signed-in owner. */
export async function setSessionVisibility(
  sessionId: string,
  userId: string,
  isPublic: boolean,
): Promise<SessionRow> {
  const db = supabaseAdmin()
  const { data: existing } = await db
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!existing) throw new SessionError('Session not found', 404)

  const { data, error } = await db
    .from('sessions')
    .update({
      is_public: isPublic,
      share_slug: (existing as SessionRow).share_slug ?? slug(),
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error || !data) throw new SessionError(`Could not update sharing: ${error?.message}`, 500)
  return data as SessionRow
}

/** Public share-link lookup. Only ever returns sessions explicitly made public. */
export async function getPublicSession(
  shareSlug: string,
): Promise<{ session: SessionRow; answers: AnswerRow[]; displayName: string | null } | null> {
  const db = supabaseAdmin()
  const { data } = await db
    .from('sessions')
    .select('*')
    .eq('share_slug', shareSlug)
    .eq('is_public', true)
    .maybeSingle()

  if (!data) return null
  const session = data as SessionRow

  const [answers, profile] = await Promise.all([
    getAnswers(session.id),
    session.user_id
      ? db.from('profiles').select('display_name').eq('id', session.user_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  return {
    session,
    answers,
    displayName: (profile as { data: { display_name: string | null } | null }).data?.display_name ?? null,
  }
}

export async function listUserSessions(userId: string): Promise<SessionRow[]> {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
  if (error) throw new SessionError(`Could not load your history: ${error.message}`, 500)
  return (data ?? []) as SessionRow[]
}

export async function deleteSession(sessionId: string, userId: string): Promise<void> {
  const db = supabaseAdmin()
  const { error } = await db.from('sessions').delete().eq('id', sessionId).eq('user_id', userId)
  if (error) throw new SessionError(`Could not delete that session: ${error.message}`, 500)
}
