import { accentHex } from '@/lib/client-types'
import { accentForTheme } from '@/lib/theme-accent'
import type { AnswerRow, ChoiceConfig, ScaleConfig, SessionSummary } from '@/lib/database.types'

/** Shared read-only rendering of a finished session. Used by the owner's
 *  results screen and by the public share page, so both stay identical. */
export default function SummaryView({
  summary,
  answers,
  showAnswers = true,
}: {
  summary: SessionSummary
  answers: AnswerRow[]
  showAnswers?: boolean
}) {
  const accent = accentHex(accentForTheme(summary.dominant_theme?.slug))

  return (
    <div>
      <div className="h-1.5 w-24 rounded-full" style={{ backgroundColor: accent }} />

      <h1 className="mt-6 font-serif text-3xl leading-tight sm:text-4xl">{summary.headline}</h1>

      <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-ink-700 py-6">
        <Stat value={summary.answered} label="answered" />
        <Stat value={summary.words} label="words" />
        <Stat value={summary.themes.length} label="themes" />
      </dl>

      {summary.signature.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-paper-faint">
            Where you landed
          </h2>
          <ul className="mt-4 space-y-2">
            {summary.signature.map((item, i) => (
              <li
                key={`${item.label}-${i}`}
                className="flex items-baseline justify-between gap-4 border-b border-ink-800 pb-2"
              >
                <span className="text-sm text-paper-faint">{item.label}</span>
                <span className="text-right text-paper">{item.value}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {summary.themes.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-paper-faint">
            How the session spread
          </h2>
          <ul className="mt-4 space-y-3">
            {summary.themes.map((theme) => {
              const share = (theme.answered / Math.max(summary.answered, 1)) * 100
              return (
                <li key={theme.slug} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-sm text-paper-dim">{theme.title}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-800">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${share}%`,
                        backgroundColor: accentHex(accentForTheme(theme.slug)),
                      }}
                    />
                  </span>
                  <span className="w-6 text-right text-xs tabular-nums text-paper-faint">
                    {theme.answered}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {showAnswers && answers.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xs uppercase tracking-[0.2em] text-paper-faint">
            What you said
          </h2>
          <div className="mt-6 space-y-8">
            {answers.map((answer) => (
              <article key={answer.id}>
                <p
                  className="text-[11px] uppercase tracking-[0.18em]"
                  style={{ color: accentHex(accentForTheme(answer.question_snapshot.theme_slug)) }}
                >
                  {answer.question_snapshot.theme_title}
                </p>
                <h3 className="mt-2 font-serif text-lg leading-snug text-paper">
                  {answer.question_snapshot.body}
                </h3>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed text-paper-dim">
                  {renderAnswer(answer)}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-serif text-3xl tabular-nums">{value}</dd>
      <p className="mt-1 text-xs uppercase tracking-wider text-paper-faint">{label}</p>
    </div>
  )
}

function renderAnswer(answer: AnswerRow) {
  if (answer.skipped) return 'Skipped.'
  const snap = answer.question_snapshot

  if (snap.kind === 'scale' && answer.value_number != null) {
    const cfg = snap.config as unknown as ScaleConfig
    return `${answer.value_number} out of ${cfg?.max ?? 5} — between “${cfg?.min_label}” and “${cfg?.max_label}”.`
  }

  if (snap.kind === 'single_choice') {
    const cfg = snap.config as unknown as ChoiceConfig
    return cfg?.choices?.find((c) => c.value === answer.value_text)?.label ?? '—'
  }

  return answer.value_text ?? '—'
}
