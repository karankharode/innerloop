import type { QuestionRow, ThemeRow } from '@/lib/database.types'

export const QUESTIONS_PER_SESSION = 10

/**
 * MVP question engine: curated bank + deterministic rules. No model in the
 * loop, by design.
 *
 * Rules, in order:
 *  1. Cover breadth — take from every theme before taking a second from any.
 *  2. Open the session with an open_text question (a scale prompt first
 *     reads as a survey and drops people).
 *  3. Prefer questions the user has not seen in their recent sessions, so a
 *     returning user gets new ground before repeats.
 *  4. Never place two questions from the same theme back to back.
 *
 * Selection is seeded per session so a reload gives the same run.
 *
 * This module is deliberately pure — no database, no server-only import —
 * so the rules can be tested directly (scripts/verify-engine.ts).
 */
export type EngineQuestion = QuestionRow & {
  theme_title: string
  theme_accent: string
}

export type { ThemeRow }

/** Small deterministic PRNG (mulberry32) so a session is reproducible. */
function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}


export function selectQuestions(
  bank: EngineQuestion[],
  opts: { seed: string; recentlySeen?: Set<string>; count?: number },
): EngineQuestion[] {
  const count = opts.count ?? QUESTIONS_PER_SESSION
  const rand = seededRandom(opts.seed)
  const seen = opts.recentlySeen ?? new Set<string>()

  // Rule 3: fresh questions first, seen ones only as fallback.
  const byTheme = new Map<string, EngineQuestion[]>()
  for (const q of bank) {
    const list = byTheme.get(q.theme_slug) ?? []
    list.push(q)
    byTheme.set(q.theme_slug, list)
  }
  for (const [slug, list] of byTheme) {
    const shuffled = shuffle(list, rand)
    const fresh = shuffled.filter((q) => !seen.has(q.id))
    const stale = shuffled.filter((q) => seen.has(q.id))
    byTheme.set(slug, [...fresh, ...stale])
  }

  // Rule 1: round-robin across themes for breadth.
  const themeOrder = shuffle([...byTheme.keys()], rand)
  const picked: EngineQuestion[] = []
  let round = 0
  while (picked.length < count && round < 20) {
    let progressed = false
    for (const slug of themeOrder) {
      if (picked.length >= count) break
      const next = byTheme.get(slug)?.shift()
      if (next) {
        picked.push(next)
        progressed = true
      }
    }
    if (!progressed) break
    round++
  }

  // Rule 2: lead with an open question.
  const firstOpen = picked.findIndex((q) => q.kind === 'open_text')
  if (firstOpen > 0) {
    const [q] = picked.splice(firstOpen, 1)
    picked.unshift(q)
  }

  return spreadThemes(picked)
}

/** Rule 4: no two adjacent questions from the same theme, where avoidable. */
function spreadThemes(questions: EngineQuestion[]): EngineQuestion[] {
  const out = [...questions]
  for (let i = 1; i < out.length; i++) {
    if (out[i].theme_slug !== out[i - 1].theme_slug) continue
    const swapWith = out.findIndex(
      (q, j) =>
        j > i &&
        q.theme_slug !== out[i - 1].theme_slug &&
        (j + 1 >= out.length || out[j + 1].theme_slug !== out[i].theme_slug),
    )
    if (swapWith > -1) {
      ;[out[i], out[swapWith]] = [out[swapWith], out[i]]
    }
  }
  return out
}
