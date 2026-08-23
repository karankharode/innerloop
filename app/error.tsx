'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app] render error', error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col justify-center px-5 text-center">
      <h1 className="font-serif text-3xl">That did not go to plan</h1>
      <p className="mt-3 text-paper-dim">
        Something broke on our side. Your answers are saved as you go, so nothing you
        wrote is lost.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-paper px-7 py-3.5 font-medium text-ink-950"
        >
          Try again
        </button>
        <Link href="/" className="text-sm text-paper-faint hover:text-paper">
          Back to the start
        </Link>
      </div>
      {error.digest && (
        <p className="mt-8 text-xs text-paper-faint">Reference: {error.digest}</p>
      )}
    </main>
  )
}
