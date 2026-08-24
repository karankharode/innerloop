'use client'

import { useState } from 'react'

export default function WaitlistForm({
  source,
  heading,
  body,
}: {
  source: string
  heading?: string
  body?: string
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    setError(null)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Could not save that email')
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Could not save that email')
    }
  }

  if (status === 'sent') {
    return (
      <p className="mt-4 text-sm leading-relaxed text-paper-dim" role="status">
        You are on the list. We will write when there is something worth sending.
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="mt-5">
      {heading && <h2 className="font-serif text-xl">{heading}</h2>}
      {body && <p className="mt-2 text-sm leading-relaxed text-paper-dim">{body}</p>}
      <label htmlFor={`waitlist-email-${source}`} className="sr-only">
        Email
      </label>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          id={`waitlist-email-${source}`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-3 text-paper placeholder:text-paper-faint/60 focus:border-ink-600"
        />
        <button
          type="submit"
          disabled={status === 'sending' || email.trim().length < 3}
          className="rounded-full bg-paper px-6 py-3 font-medium text-ink-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === 'sending' ? 'Saving…' : 'Notify me'}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-accent-rose" role="alert">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-paper-faint">
        Email only. No password. We will not sell this or spam you.
      </p>
    </form>
  )
}
