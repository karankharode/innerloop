'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { accentHex, type ClientAnswer, type ClientQuestion } from '@/lib/client-types'
import type { ChoiceConfig, ScaleConfig } from '@/lib/database.types'

const RESUME_KEY = 'innerloop:active-session'

type Phase = 'loading' | 'ready' | 'submitting' | 'error'

interface Draft {
  text: string
  number: number | null
}

export default function ReflectionFlow() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<ClientQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [saving, setSaving] = useState(false)
  const startedRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /** Resume an in-progress run if this browser has one, else start fresh. */
  const boot = useCallback(async () => {
    setPhase('loading')
    setError(null)

    const existingId =
      typeof window !== 'undefined' ? window.localStorage.getItem(RESUME_KEY) : null

    if (existingId) {
      try {
        const res = await fetch(`/api/sessions/${existingId}`, { cache: 'no-store' })
        if (res.ok) {
          const data = (await res.json()) as {
            status: string
            questions: ClientQuestion[]
            answers: ClientAnswer[]
          }
          if (data.status === 'completed') {
            window.localStorage.removeItem(RESUME_KEY)
            router.replace(`/results/${existingId}`)
            return
          }
          const restored: Record<string, Draft> = {}
          for (const a of data.answers) {
            restored[a.questionId] = { text: a.text ?? '', number: a.number }
          }
          setSessionId(existingId)
          setQuestions(data.questions)
          setDrafts(restored)
          setIndex(Math.min(data.answers.length, Math.max(data.questions.length - 1, 0)))
          setPhase('ready')
          return
        }
        // 404/401 means the cookie or session is gone — fall through to a new run.
        window.localStorage.removeItem(RESUME_KEY)
      } catch {
        window.localStorage.removeItem(RESUME_KEY)
      }
    }

    try {
      const res = await fetch('/api/sessions', { method: 'POST' })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Could not start a session')
      }
      const data = (await res.json()) as { sessionId: string; questions: ClientQuestion[] }
      window.localStorage.setItem(RESUME_KEY, data.sessionId)
      setSessionId(data.sessionId)
      setQuestions(data.questions)
      setIndex(0)
      setPhase('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start a session')
      setPhase('error')
    }
  }, [router])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    void boot()
  }, [boot])

  const question = questions[index]
  const draft: Draft = useMemo(
    () => (question ? (drafts[question.id] ?? { text: '', number: null }) : { text: '', number: null }),
    [drafts, question],
  )

  useEffect(() => {
    if (question?.kind === 'open_text') textareaRef.current?.focus()
  }, [question?.id, question?.kind])

  const setDraft = (patch: Partial<Draft>) => {
    if (!question) return
    setDrafts((prev) => ({
      ...prev,
      [question.id]: { ...(prev[question.id] ?? { text: '', number: null }), ...patch },
    }))
  }

  const persist = async (skipped: boolean) => {
    if (!sessionId || !question) return
    const payload = {
      questionId: question.id,
      text: question.kind === 'open_text' ? draft.text : draft.text || null,
      number: question.kind === 'scale' ? draft.number : null,
      skipped,
    }
    const res = await fetch(`/api/sessions/${sessionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error ?? 'Could not save that answer')
    }
  }

  const hasContent =
    (question?.kind === 'scale' && draft.number != null) ||
    (question?.kind === 'single_choice' && Boolean(draft.text)) ||
    (question?.kind === 'open_text' && draft.text.trim().length > 0)

  const advance = async (skipped: boolean) => {
    if (!question || saving) return
    setSaving(true)
    setError(null)
    try {
      await persist(skipped)
      if (index < questions.length - 1) {
        setIndex(index + 1)
      } else {
        await finish()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that answer')
    } finally {
      setSaving(false)
    }
  }

  const finish = async () => {
    if (!sessionId) return
    setPhase('submitting')
    const res = await fetch(`/api/sessions/${sessionId}/complete`, { method: 'POST' })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setPhase('ready')
      throw new Error(body.error ?? 'Could not finish the session')
    }
    window.localStorage.removeItem(RESUME_KEY)
    router.push(`/results/${sessionId}`)
  }

  // Cmd/Ctrl+Enter advances, matching the muscle memory of every text box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && hasContent) {
        e.preventDefault()
        void advance(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (phase === 'loading') {
    return (
      <div className="pt-24 text-center text-paper-dim" role="status" aria-live="polite">
        Picking your questions…
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="pt-24 text-center">
        <p className="text-paper">{error ?? 'Something went wrong.'}</p>
        <button
          onClick={() => void boot()}
          className="mt-5 rounded-full bg-paper px-6 py-3 font-medium text-ink-950"
        >
          Try again
        </button>
      </div>
    )
  }

  if (phase === 'submitting') {
    return (
      <div className="pt-24 text-center text-paper-dim" role="status" aria-live="polite">
        Putting your session together…
      </div>
    )
  }

  if (!question) return null

  const accent = accentHex(question.theme.accent)
  const progress = ((index + (hasContent ? 1 : 0)) / questions.length) * 100
  const isLast = index === questions.length - 1

  return (
    <div className="pt-6">
      {/* Progress */}
      <div className="flex items-center gap-4">
        <div
          className="h-[3px] flex-1 overflow-hidden rounded-full bg-ink-800"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-label="Session progress"
        >
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${progress}%`, backgroundColor: accent }}
          />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-paper-faint">
          {index + 1} / {questions.length}
        </span>
      </div>

      <div key={question.id} className="animate-rise pt-12">
        <p
          className="text-xs uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          {question.theme.title}
        </p>

        <h1 className="mt-4 font-serif text-2xl leading-snug sm:text-3xl">{question.body}</h1>

        {question.helperText && (
          <p className="mt-3 text-sm text-paper-faint">{question.helperText}</p>
        )}

        <div className="mt-8">
          {question.kind === 'open_text' && (
            <textarea
              ref={textareaRef}
              value={draft.text}
              onChange={(e) => setDraft({ text: e.target.value })}
              rows={6}
              maxLength={5000}
              placeholder="Write as much or as little as you like…"
              aria-label={question.body}
              className="w-full resize-y rounded-xl border border-ink-700 bg-ink-900/70 p-4 font-serif text-lg leading-relaxed text-paper placeholder:text-paper-faint/60 focus:border-ink-600"
            />
          )}

          {question.kind === 'scale' && (
            <ScaleInput
              config={question.config as unknown as ScaleConfig}
              value={draft.number}
              accent={accent}
              onChange={(n) => setDraft({ number: n })}
            />
          )}

          {question.kind === 'single_choice' && (
            <ChoiceInput
              config={question.config as unknown as ChoiceConfig}
              value={draft.text}
              accent={accent}
              onChange={(v) => setDraft({ text: v })}
            />
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-accent-rose" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => void advance(false)}
            disabled={!hasContent || saving}
            className="rounded-full bg-paper px-6 py-3 font-medium text-ink-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Saving…' : isLast ? 'See my session' : 'Next'}
          </button>

          <button
            onClick={() => void advance(true)}
            disabled={saving}
            className="rounded-full px-4 py-3 text-sm text-paper-dim transition-colors hover:text-paper disabled:opacity-40"
          >
            Skip this one
          </button>

          {index > 0 && (
            <button
              onClick={() => setIndex(index - 1)}
              disabled={saving}
              className="ml-auto rounded-full px-4 py-3 text-sm text-paper-faint transition-colors hover:text-paper disabled:opacity-40"
            >
              Back
            </button>
          )}
        </div>

        <p className="mt-6 text-xs text-paper-faint">
          Saved as you go. You can close this and come back.
        </p>
      </div>
    </div>
  )
}

function ScaleInput({
  config,
  value,
  accent,
  onChange,
}: {
  config: ScaleConfig
  value: number | null
  accent: string
  onChange: (n: number) => void
}) {
  const min = config?.min ?? 1
  const max = config?.max ?? 5
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <div>
      <div className="flex gap-2" role="radiogroup" aria-label="Rating">
        {steps.map((n) => {
          const selected = value === n
          return (
            <button
              key={n}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(n)}
              className="flex-1 rounded-xl border py-5 text-lg tabular-nums transition-colors"
              style={{
                borderColor: selected ? accent : 'var(--color-ink-700)',
                backgroundColor: selected ? `${accent}22` : 'transparent',
                color: selected ? accent : 'var(--color-paper-dim)',
              }}
            >
              {n}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex justify-between text-xs text-paper-faint">
        <span>{config?.min_label}</span>
        <span>{config?.max_label}</span>
      </div>
    </div>
  )
}

function ChoiceInput({
  config,
  value,
  accent,
  onChange,
}: {
  config: ChoiceConfig
  value: string | null
  accent: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label="Choose one">
      {(config?.choices ?? []).map((choice) => {
        const selected = value === choice.value
        return (
          <button
            key={choice.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(choice.value)}
            className="w-full rounded-xl border px-5 py-4 text-left transition-colors"
            style={{
              borderColor: selected ? accent : 'var(--color-ink-700)',
              backgroundColor: selected ? `${accent}1a` : 'transparent',
              color: selected ? 'var(--color-paper)' : 'var(--color-paper-dim)',
            }}
          >
            {choice.label}
          </button>
        )
      })}
    </div>
  )
}
