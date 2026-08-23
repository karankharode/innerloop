import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SummaryView from '@/components/SummaryView'
import { getPublicSession } from '@/lib/sessions'
import { brand } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getPublicSession(slug)
  if (!result?.session.summary) return { title: 'Session not found' }

  const who = result.displayName ? `${result.displayName}'s` : 'A'
  return {
    title: `${who} ${brand.name} session`,
    description: result.session.summary.headline,
    openGraph: {
      title: `${who} ${brand.name} session`,
      description: result.session.summary.headline,
      type: 'article',
    },
    twitter: { card: 'summary_large_image' },
  }
}

/** Public, read-only view of a session its owner chose to publish. */
export default async function PublicSessionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getPublicSession(slug)
  const summary = result?.session.summary
  if (!result || !summary) notFound()

  const { session, answers, displayName } = result

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 sm:px-8">
      <header className="flex items-center justify-between py-6">
        <Link href="/" className="font-serif text-lg tracking-tight">
          {brand.name}
        </Link>
        <span className="text-xs uppercase tracking-[0.2em] text-paper-faint">
          Shared session
        </span>
      </header>

      <div className="animate-rise pt-4">
        <p className="text-sm text-paper-faint">
          {displayName ? `${displayName} · ` : ''}
          {session.completed_at
            ? new Date(session.completed_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : ''}
        </p>

        <div className="mt-6">
          <SummaryView summary={summary} answers={answers} />
        </div>

        <section className="mt-16 rounded-2xl border border-ink-700 bg-ink-900/70 p-6 text-center">
          <h2 className="font-serif text-2xl">{brand.tagline}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-paper-dim">
            {brand.shortDescription}
          </p>
          <Link
            href="/reflect"
            className="mt-6 inline-flex rounded-full bg-paper px-7 py-3.5 font-medium text-ink-950"
          >
            Try your own session
          </Link>
        </section>
      </div>
    </main>
  )
}
