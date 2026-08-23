import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import { getCurrentUser } from '@/lib/supabase/server'
import { listUserSessions } from '@/lib/sessions'
import { accentHex } from '@/lib/client-types'
import { accentForTheme } from '@/lib/theme-accent'

export const metadata: Metadata = {
  title: 'Your history',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/** Every session this account owns — the introspection history. */
export default async function HistoryPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=%2Fhistory')

  const sessions = await listUserSessions(user.id)
  const completed = sessions.filter((s) => s.status === 'completed' && s.summary)

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-2xl px-5 pb-24 sm:px-8">
        <div className="animate-rise pt-6">
          <h1 className="font-serif text-3xl">Your sessions</h1>
          <p className="mt-2 text-paper-dim">
            {completed.length === 0
              ? 'Nothing saved yet.'
              : `${completed.length} session${completed.length === 1 ? '' : 's'}, oldest at the bottom.`}
          </p>

          {completed.length === 0 ? (
            <Link
              href="/reflect"
              className="mt-8 inline-flex rounded-full bg-paper px-7 py-3.5 font-medium text-ink-950"
            >
              Start your first session
            </Link>
          ) : (
            <ul className="mt-10 space-y-3">
              {completed.map((session) => {
                const accent = accentHex(accentForTheme(session.summary!.dominant_theme?.slug))
                return (
                  <li key={session.id}>
                    <Link
                      href={`/results/${session.id}`}
                      className="block rounded-2xl border border-ink-700 bg-ink-900/50 p-5 transition-colors hover:border-ink-600"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs uppercase tracking-[0.18em] text-paper-faint">
                          {session.completed_at
                            ? new Date(session.completed_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : ''}
                        </span>
                        {session.is_public && (
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[11px]"
                            style={{ backgroundColor: `${accent}22`, color: accent }}
                          >
                            Public
                          </span>
                        )}
                      </div>

                      <p className="mt-3 font-serif text-lg leading-snug">
                        {session.summary!.headline}
                      </p>

                      <p className="mt-2 text-sm text-paper-faint">
                        {session.summary!.answered} answered · {session.summary!.words} words
                        {session.summary!.dominant_theme
                          ? ` · mostly ${session.summary!.dominant_theme.title.toLowerCase()}`
                          : ''}
                      </p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          {completed.length > 0 && (
            <Link
              href="/reflect"
              className="mt-10 inline-flex rounded-full border border-ink-600 px-6 py-3 text-paper transition-colors hover:border-paper-faint"
            >
              Start another session
            </Link>
          )}
        </div>
      </main>
    </>
  )
}
