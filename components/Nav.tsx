import Link from 'next/link'
import { brand } from '@/lib/brand'
import { getCurrentUser } from '@/lib/supabase/server'

export default async function Nav() {
  const user = await getCurrentUser()

  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6 sm:px-8">
      <Link
        href="/"
        className="font-serif text-lg tracking-tight text-paper transition-opacity hover:opacity-80"
      >
        {brand.name}
      </Link>

      <nav className="flex items-center gap-1 text-sm text-paper-dim sm:gap-4">
        {user ? (
          <>
            <Link href="/history" className="rounded px-2 py-1 transition-colors hover:text-paper">
              History
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded px-2 py-1 transition-colors hover:text-paper"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className="rounded px-2 py-1 transition-colors hover:text-paper">
            Notify me
          </Link>
        )}
      </nav>
    </header>
  )
}
