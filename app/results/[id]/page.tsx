import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import SummaryView from '@/components/SummaryView'
import ShareControls from '@/components/ShareControls'
import { getAnswers, getOwnedSession } from '@/lib/sessions'
import { currentActor } from '@/lib/api'
import { getCurrentUser } from '@/lib/supabase/server'
import { siteUrl } from '@/lib/env'

export const metadata: Metadata = {
  title: 'Your session',
  // A private results page should never end up in an index.
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [session, user] = await Promise.all([
    getOwnedSession(id, await currentActor()),
    getCurrentUser(),
  ])

  if (!session) notFound()
  if (session.status !== 'completed' || !session.summary) redirect('/reflect')

  const answers = await getAnswers(session.id)

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-2xl px-5 pb-24 sm:px-8">
        <div className="animate-rise pt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-paper-faint">
            {session.completed_at
              ? new Date(session.completed_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Just now'}
          </p>

          <div className="mt-6">
            <SummaryView summary={session.summary} answers={answers} />
          </div>

          <ShareControls
            sessionId={session.id}
            signedIn={Boolean(user)}
            initialIsPublic={session.is_public}
            initialShareUrl={session.share_slug ? `${siteUrl}/s/${session.share_slug}` : null}
          />

          <div className="mt-10 flex flex-wrap gap-4 border-t border-ink-700 pt-8 text-sm">
            <Link href="/reflect" className="text-paper-dim transition-colors hover:text-paper">
              Start another session
            </Link>
            {user && (
              <Link href="/history" className="text-paper-dim transition-colors hover:text-paper">
                See your history
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
