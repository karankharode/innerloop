'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { publicEnv } from '@/lib/env'

export default function LoginForm({ nextPath }: { nextPath: string | null }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return

    setStatus('sending')
    setError(null)

    const safeNext = nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')
      ? nextPath
      : '/history'

    const redirectTo = `${publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/auth/callback?next=${encodeURIComponent(safeNext)}`

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      })
      if (authError) throw authError
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof Error
          ? err.message
          : 'We could not send that link. Please try again in a moment.',
      )
    }
  }

  if (status === 'sent') {
    return (
      <div className="mt-8 rounded-2xl border border-ink-700 bg-ink-900/70 p-6" role="status">
        <h2 className="font-serif text-xl">Check your email</h2>
        <p className="mt-2 text-sm leading-relaxed text-paper-dim">
          We sent a sign-in link to <span className="text-paper">{email}</span>. It
          expires in an hour. Open it in this browser so your current session gets
          attached to your account.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm text-paper-faint underline hover:text-paper"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mt-8">
      <label htmlFor="email" className="text-xs uppercase tracking-[0.2em] text-paper-faint">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="mt-2 w-full rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-3.5 text-paper placeholder:text-paper-faint/60 focus:border-ink-600"
      />

      {error && (
        <p className="mt-3 text-sm text-accent-rose" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending' || email.trim().length < 3}
        className="mt-5 w-full rounded-full bg-paper px-6 py-3.5 font-medium text-ink-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
      </button>

      <p className="mt-4 text-xs leading-relaxed text-paper-faint">
        We only use your email to sign you in and to recover your account. No
        marketing, no sharing.
      </p>
    </form>
  )
}
