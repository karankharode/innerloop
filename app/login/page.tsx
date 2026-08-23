import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import LoginForm from '@/components/LoginForm'
import { getCurrentUser } from '@/lib/supabase/server'
import { brand } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  const user = await getCurrentUser()
  if (user) redirect(next && next.startsWith('/') ? next : '/history')

  const message =
    error === 'link_expired'
      ? 'That link has expired. Enter your email and we will send a fresh one.'
      : error === 'missing_code'
        ? 'That sign-in link looked incomplete. Try again below.'
        : null

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-md px-5 pb-24 sm:px-8">
        <div className="animate-rise pt-10 sm:pt-16">
          <h1 className="font-serif text-3xl">Save your sessions</h1>
          <p className="mt-3 leading-relaxed text-paper-dim">
            {brand.name} uses one-time email links — no password to remember. Any
            session you have already answered in this browser is attached to your
            account automatically.
          </p>

          {message && (
            <p
              className="mt-6 rounded-lg border border-accent-rose/40 bg-accent-rose/10 px-4 py-3 text-sm text-paper"
              role="alert"
            >
              {message}
            </p>
          )}

          <Suspense fallback={null}>
            <LoginForm nextPath={next ?? null} />
          </Suspense>
        </div>
      </main>
    </>
  )
}
