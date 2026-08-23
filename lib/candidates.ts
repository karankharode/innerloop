import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AnswerRow, SessionSummary } from '@/lib/database.types'

/**
 * Candidate logging for the future feedback-iteration loop.
 *
 * Design constraints, deliberately strict:
 *  - Nothing written here is ever served to a user. Rows are `pending` and
 *    only a human can promote one (docs/REVIEW-LOOP.md).
 *  - `proposed_body` is always generated from a fixed template. Raw user
 *    text is never copied into it, so an approved candidate can never be a
 *    laundered version of something a stranger typed.
 *  - `signal_payload` carries derived, aggregate signals only — theme slugs,
 *    length buckets, counts. Never answer text.
 *  - Failures here must never break a user's session, so every call is
 *    wrapped and swallowed by the caller.
 */

interface CandidateInput {
  kind: 'question' | 'pattern'
  themeSlug: string | null
  proposedBody: string
  rationale: string
  dedupeKey: string
  signal: Record<string, unknown>
}

async function logCandidate(input: CandidateInput) {
  const db = supabaseAdmin()

  const { data: existing } = await db
    .from('question_candidates')
    .select('id, occurrences')
    .eq('dedupe_key', input.dedupeKey)
    .maybeSingle()

  if (existing) {
    await db
      .from('question_candidates')
      .update({
        occurrences: existing.occurrences + 1,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
    return
  }

  await db.from('question_candidates').insert({
    kind: input.kind,
    theme_slug: input.themeSlug,
    proposed_body: input.proposedBody,
    rationale: input.rationale,
    dedupe_key: input.dedupeKey,
    signal_payload: input.signal as never,
    status: 'pending',
  })
}

function lengthBucket(words: number) {
  if (words === 0) return 'empty'
  if (words < 10) return 'terse'
  if (words < 40) return 'normal'
  if (words < 100) return 'long'
  return 'essay'
}

/**
 * Runs once, at session completion. Emits at most a handful of rows.
 */
export async function logCandidatesForSession(
  answers: AnswerRow[],
  summary: SessionSummary,
): Promise<void> {
  const tasks: Promise<void>[] = []

  // Signal 1 — a question people keep skipping is a question worth rewriting.
  for (const a of answers.filter((x) => x.skipped)) {
    tasks.push(
      logCandidate({
        kind: 'pattern',
        themeSlug: a.question_snapshot.theme_slug,
        proposedBody: `Rewrite or retire: "${a.question_snapshot.body}"`,
        rationale:
          'Question was skipped. Repeated skips suggest it is unclear, too personal, or too effortful for its position in the run.',
        dedupeKey: `skip:${a.question_id}`,
        signal: { question_id: a.question_id, theme: a.question_snapshot.theme_slug, kind: 'skip' },
      }).catch(() => {}),
    )
  }

  // Signal 2 — a question that consistently pulls essays deserves a follow-up.
  for (const a of answers.filter((x) => !x.skipped && x.question_snapshot.kind === 'open_text')) {
    const words = (a.value_text?.match(/\S+/g) ?? []).length
    if (words < 100) continue
    tasks.push(
      logCandidate({
        kind: 'question',
        themeSlug: a.question_snapshot.theme_slug,
        proposedBody: `Add a follow-up to: "${a.question_snapshot.body}" — people write at length here, so a second, narrower question could go further.`,
        rationale:
          'Answers to this question run long, which usually means the prompt opened something the run does not then follow up on.',
        dedupeKey: `depth:${a.question_id}`,
        signal: {
          question_id: a.question_id,
          theme: a.question_snapshot.theme_slug,
          length_bucket: lengthBucket(words),
        },
      }).catch(() => {}),
    )
  }

  // Signal 3 — themes that dominate sessions are under-served by the bank.
  if (summary.dominant_theme && summary.answered >= 5) {
    tasks.push(
      logCandidate({
        kind: 'pattern',
        themeSlug: summary.dominant_theme.slug,
        proposedBody: `Deepen the "${summary.dominant_theme.title}" theme — it is where sessions concentrate.`,
        rationale:
          'This theme repeatedly accounts for the bulk of a session, so the bank likely needs more range within it rather than more breadth across themes.',
        dedupeKey: `dominant:${summary.dominant_theme.slug}`,
        signal: { theme: summary.dominant_theme.slug, answered: summary.answered },
      }).catch(() => {}),
    )
  }

  await Promise.allSettled(tasks)
}
