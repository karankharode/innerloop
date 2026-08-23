import type { AnswerRow, SessionSummary, ScaleConfig, ChoiceConfig } from '@/lib/database.types'

const WORD_RE = /\S+/g

function wordCount(text: string | null) {
  return text ? (text.match(WORD_RE)?.length ?? 0) : 0
}

function headlineFor(dominant: string | null, answered: number, words: number) {
  if (answered === 0) return 'A session started, and left for another day.'
  if (words > 400) return `You had a lot to say — most of it about ${dominant ?? 'yourself'}.`
  if (words < 60) return 'Short answers. Sometimes that is the honest ones.'
  if (dominant) return `This session was mostly about ${dominant.toLowerCase()}.`
  return 'A clear look across the whole picture.'
}

/**
 * Derives the results-screen summary from the answers alone. Pure and
 * deterministic — no model call, no network — so results are stable and
 * reproducible from stored data.
 */
export function buildSummary(answers: AnswerRow[]): SessionSummary {
  const answered = answers.filter((a) => !a.skipped)
  const skipped = answers.filter((a) => a.skipped)

  const words = answered.reduce((n, a) => n + wordCount(a.value_text), 0)

  const themeCounts = new Map<string, { slug: string; title: string; answered: number }>()
  for (const a of answered) {
    const { theme_slug, theme_title } = a.question_snapshot
    const entry = themeCounts.get(theme_slug) ?? { slug: theme_slug, title: theme_title, answered: 0 }
    entry.answered += 1
    themeCounts.set(theme_slug, entry)
  }

  // Depth beats count: weight by words written, falling back to answer count.
  const themeDepth = new Map<string, number>()
  for (const a of answered) {
    const slug = a.question_snapshot.theme_slug
    themeDepth.set(slug, (themeDepth.get(slug) ?? 0) + wordCount(a.value_text) + 3)
  }
  const dominantSlug = [...themeDepth.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const dominant = dominantSlug ? (themeCounts.get(dominantSlug) ?? null) : null

  // Highlight: the longest open-text answer, lightly trimmed for the card.
  const longest = answered
    .filter((a) => a.question_snapshot.kind === 'open_text' && (a.value_text ?? '').trim().length > 0)
    .sort((a, b) => wordCount(b.value_text) - wordCount(a.value_text))[0]

  const highlight = longest
    ? {
        question: longest.question_snapshot.body,
        answer: truncate((longest.value_text ?? '').trim(), 220),
      }
    : null

  // Signature: the structured answers, rendered as readable labels.
  const signature: { label: string; value: string }[] = []
  for (const a of answered) {
    const snap = a.question_snapshot
    if (snap.kind === 'single_choice') {
      const cfg = snap.config as unknown as ChoiceConfig
      const match = cfg?.choices?.find((c) => c.value === a.value_text)
      if (match) signature.push({ label: snap.theme_title, value: match.label })
    } else if (snap.kind === 'scale' && a.value_number != null) {
      const cfg = snap.config as unknown as ScaleConfig
      const max = cfg?.max ?? 5
      signature.push({ label: snap.theme_title, value: `${a.value_number} / ${max}` })
    }
  }

  return {
    answered: answered.length,
    skipped: skipped.length,
    total: answers.length,
    words,
    themes: [...themeCounts.values()].sort((a, b) => b.answered - a.answered),
    dominant_theme: dominant ? { slug: dominant.slug, title: dominant.title } : null,
    headline: headlineFor(dominant?.title ?? null, answered.length, words),
    highlight,
    signature: signature.slice(0, 4),
    generated_at: new Date().toISOString(),
  }
}

export function truncate(text: string, max: number) {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`
}
