'use client'

import { useState } from 'react'
import Link from 'next/link'
import WaitlistForm from '@/components/WaitlistForm'

/**
 * Signed-in owners get the card and public link. Everyone else can leave
 * an email for what comes next.
 */
export default function ShareControls({
  sessionId,
  signedIn,
  initialIsPublic,
  initialShareUrl,
}: {
  sessionId: string
  signedIn: boolean
  initialIsPublic: boolean
  initialShareUrl: string | null
}) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [shareUrl, setShareUrl] = useState(initialShareUrl)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!signedIn) {
    return (
      <aside className="mt-12 rounded-2xl border border-ink-700 bg-ink-900/70 p-6">
        <WaitlistForm
          source="results"
          heading="Want what comes next?"
          body="Leave an email. We will write when Innerloop has something new worth your time. No account, no password."
        />
        <Link href="/reflect" className="mt-5 inline-block text-sm text-paper-dim hover:text-paper">
          Or start another session
        </Link>
      </aside>
    )
  }

  const toggleShare = async (next: boolean) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: next }),
      })
      const body = (await res.json()) as { error?: string; isPublic?: boolean; shareUrl?: string }
      if (!res.ok) throw new Error(body.error ?? 'Could not update sharing')
      setIsPublic(Boolean(body.isPublic))
      setShareUrl(body.shareUrl ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update sharing')
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Copy failed — select the link and copy it manually.')
    }
  }

  return (
    <aside className="mt-12 rounded-2xl border border-ink-700 bg-ink-900/70 p-6">
      <h2 className="font-serif text-xl">Share it</h2>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={`/api/card/${sessionId}?download=1`}
          download
          className="rounded-full bg-paper px-6 py-3 font-medium text-ink-950"
        >
          Download card
        </a>
        <button
          onClick={() => void toggleShare(!isPublic)}
          disabled={busy}
          className="rounded-full border border-ink-600 px-6 py-3 text-paper transition-colors hover:border-paper-faint disabled:opacity-50"
        >
          {busy ? 'Working…' : isPublic ? 'Turn off public link' : 'Create public link'}
        </button>
      </div>

      {isPublic && shareUrl && (
        <div className="mt-5">
          <label htmlFor="share-url" className="text-xs uppercase tracking-[0.2em] text-paper-faint">
            Public read-only link
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="share-url"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-paper-dim"
            />
            <button
              onClick={() => void copy()}
              className="rounded-lg border border-ink-600 px-4 py-2.5 text-sm text-paper transition-colors hover:border-paper-faint"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="mt-3 text-xs text-paper-faint">
            Anyone with this link can read this session. Turn it off any time and the
            link stops working.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-accent-rose" role="alert">
          {error}
        </p>
      )}
    </aside>
  )
}
