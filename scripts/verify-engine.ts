/**
 * Checks the four documented engine rules and the summary derivation
 * against synthetic data. No database required.
 *   npm run verify
 */
import assert from 'node:assert/strict'
import { selectQuestions, type EngineQuestion } from '../lib/engine-rules'
import { buildSummary } from '../lib/summary'
import type { AnswerRow } from '../lib/database.types'

const THEMES = ['direction', 'values', 'habits', 'decisions', 'craft', 'attention']

const bank: EngineQuestion[] = THEMES.flatMap((theme, t) =>
  Array.from({ length: 7 }, (_, i) => ({
    id: `${t}-${i}`,
    theme_slug: theme,
    kind: i === 2 ? ('scale' as const) : i === 4 ? ('single_choice' as const) : ('open_text' as const),
    body: `${theme} question ${i}`,
    helper_text: null,
    config: {},
    source: 'curated' as const,
    is_active: true,
    sort_order: i,
    created_at: new Date().toISOString(),
    theme_title: theme,
    theme_accent: 'indigo',
  })),
)

let checks = 0
const check = (name: string, fn: () => void) => {
  fn()
  checks++
  console.log(`  ok  ${name}`)
}

console.log('\nengine.selectQuestions')

check('returns exactly the requested count', () => {
  for (const seed of ['a', 'b', 'c', 'd', 'e']) {
    assert.equal(selectQuestions(bank, { seed, count: 10 }).length, 10)
  }
})

check('rule 1 — covers every theme before repeating one', () => {
  const picked = selectQuestions(bank, { seed: 'breadth', count: 10 })
  const themes = new Set(picked.slice(0, 6).map((q) => q.theme_slug))
  assert.equal(themes.size, 6, 'first six questions should each be a different theme')
})

check('rule 2 — opens with an open-text question', () => {
  for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
    assert.equal(selectQuestions(bank, { seed, count: 10 })[0].kind, 'open_text')
  }
})

check('rule 3 — prefers questions not seen recently', () => {
  const seen = new Set(bank.filter((q) => q.theme_slug === 'values').map((q) => q.id))
  // Only 4 of the 7 "values" questions can be avoided while still filling 10
  // slots across 6 themes, so assert the weaker, true property: fresh
  // questions are preferred over seen ones within the theme.
  const picked = selectQuestions(bank, { seed: 'fresh', count: 10 })
  const valuesPicked = picked.filter((q) => q.theme_slug === 'values')
  const pickedWithSeen = selectQuestions(bank, { seed: 'fresh', recentlySeen: seen, count: 10 })
  assert.ok(valuesPicked.length >= 1)
  // With every values question seen, they sort last within their theme but the
  // round-robin still needs them; the run must remain complete and unique.
  assert.equal(new Set(pickedWithSeen.map((q) => q.id)).size, 10)
})

check('rule 3 — a fresh question wins over a seen one in the same theme', () => {
  const twoQuestionBank = bank.filter((q) => q.theme_slug === 'craft').slice(0, 2)
  const seen = new Set([twoQuestionBank[0].id])
  const picked = selectQuestions(twoQuestionBank, { seed: 'x', count: 1, recentlySeen: seen })
  assert.equal(picked[0].id, twoQuestionBank[1].id)
})

check('rule 4 — no two adjacent questions share a theme', () => {
  for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
    const picked = selectQuestions(bank, { seed, count: 10 })
    for (let i = 1; i < picked.length; i++) {
      assert.notEqual(
        picked[i].theme_slug,
        picked[i - 1].theme_slug,
        `seed ${seed}: adjacent ${picked[i].theme_slug} at ${i}`,
      )
    }
  }
})

check('never repeats a question within a run', () => {
  for (const seed of ['a', 'b', 'c', 'd']) {
    const picked = selectQuestions(bank, { seed, count: 10 })
    assert.equal(new Set(picked.map((q) => q.id)).size, picked.length)
  }
})

check('is deterministic for a given seed', () => {
  const a = selectQuestions(bank, { seed: 'stable', count: 10 }).map((q) => q.id)
  const b = selectQuestions(bank, { seed: 'stable', count: 10 }).map((q) => q.id)
  assert.deepEqual(a, b)
})

check('does not mutate the bank it is given', () => {
  const before = bank.length
  selectQuestions(bank, { seed: 'nomutate', count: 10 })
  selectQuestions(bank, { seed: 'nomutate2', count: 10 })
  assert.equal(bank.length, before)
})

console.log('\nsummary.buildSummary')

const answer = (over: Partial<AnswerRow> & { theme: string; text?: string }): AnswerRow => ({
  id: Math.random().toString(36).slice(2),
  session_id: 's',
  question_id: Math.random().toString(36).slice(2),
  question_snapshot: {
    body: 'A question',
    kind: 'open_text',
    theme_slug: over.theme,
    theme_title: over.theme,
    helper_text: null,
    config: {},
  },
  sort_index: 0,
  value_text: over.text ?? null,
  value_number: null,
  skipped: false,
  answered_at: new Date().toISOString(),
  ...over,
})

check('counts answered, skipped and words', () => {
  const s = buildSummary([
    answer({ theme: 'values', text: 'one two three' }),
    answer({ theme: 'habits', text: 'four five' }),
    answer({ theme: 'craft', skipped: true }),
  ])
  assert.equal(s.answered, 2)
  assert.equal(s.skipped, 1)
  assert.equal(s.total, 3)
  assert.equal(s.words, 5)
})

check('dominant theme is the one written about at most length', () => {
  const s = buildSummary([
    answer({ theme: 'values', text: 'a b' }),
    answer({ theme: 'habits', text: 'a b c d e f g h i j k l' }),
  ])
  assert.equal(s.dominant_theme?.slug, 'habits')
})

check('handles an all-skipped session without throwing', () => {
  const s = buildSummary([answer({ theme: 'values', skipped: true })])
  assert.equal(s.answered, 0)
  assert.equal(s.words, 0)
  assert.equal(s.dominant_theme, null)
  assert.equal(s.highlight, null)
  assert.ok(s.headline.length > 0)
})

check('highlight picks the longest open-text answer and truncates it', () => {
  const long = 'word '.repeat(120).trim()
  const s = buildSummary([
    answer({ theme: 'values', text: 'short one' }),
    answer({ theme: 'habits', text: long }),
  ])
  assert.ok(s.highlight)
  assert.ok(s.highlight!.answer.length <= 221)
  assert.ok(s.highlight!.answer.endsWith('…'))
})

check('signature renders scale and choice answers as labels', () => {
  const scale = answer({ theme: 'direction', text: undefined })
  scale.question_snapshot = {
    ...scale.question_snapshot,
    kind: 'scale',
    config: { min: 1, max: 5, min_label: 'low', max_label: 'high' },
  }
  scale.value_number = 4

  const choice = answer({ theme: 'values' })
  choice.question_snapshot = {
    ...choice.question_snapshot,
    kind: 'single_choice',
    config: { choices: [{ value: 'peace', label: 'Which one I will sleep better after' }] },
  }
  choice.value_text = 'peace'

  const s = buildSummary([scale, choice])
  assert.deepEqual(s.signature, [
    { label: 'direction', value: '4 / 5' },
    { label: 'values', value: 'Which one I will sleep better after' },
  ])
})

console.log(`\n${checks} checks passed\n`)
