import Link from 'next/link'
import Nav from '@/components/Nav'
import { brand } from '@/lib/brand'
import { QUESTIONS_PER_SESSION } from '@/lib/engine'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const revalidate = 3600

async function themeList() {
  try {
    const { data } = await supabaseAdmin().from('themes').select('*').order('sort_order')
    return data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const themes = await themeList()

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
        <section className="animate-rise pt-10 sm:pt-20">
          <p className="text-sm uppercase tracking-[0.2em] text-paper-faint">
            {QUESTIONS_PER_SESSION} questions · about 8 minutes
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-[1.1] tracking-tight sm:text-6xl">
            {brand.tagline}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper-dim">
            No account. No feed. No advice. {brand.name} asks you a short sequence of
            questions about your goals, values, habits and decisions — then shows you
            what you just said, in one place.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/reflect"
              className="inline-flex items-center justify-center rounded-full bg-paper px-7 py-3.5 font-medium text-ink-950 transition-transform hover:scale-[1.02] active:scale-100"
            >
              Start a session
            </Link>
            <span className="text-sm text-paper-faint sm:ml-2">
              Start anonymously — save it at the end if you want to.
            </span>
          </div>
        </section>

        {themes.length > 0 && (
          <section className="mt-20 border-t border-ink-700 pt-10">
            <h2 className="font-serif text-2xl">What it asks about</h2>
            <ul className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {themes.map((theme) => (
                <li key={theme.slug}>
                  <h3 className="text-base font-medium text-paper">{theme.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-paper-dim">
                    {theme.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-16 border-t border-ink-700 pt-10">
          <h2 className="font-serif text-2xl">How it works</h2>
          <ol className="mt-6 space-y-5 text-paper-dim">
            <li className="flex gap-4">
              <span className="font-serif text-xl text-paper-faint">1</span>
              <p className="leading-relaxed">
                Answer {QUESTIONS_PER_SESSION} questions at your own pace. Skip any of
                them. Nothing is scored.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="font-serif text-xl text-paper-faint">2</span>
              <p className="leading-relaxed">
                Get a summary of the session — the theme you went deepest on, what you
                wrote, and a card you can keep.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="font-serif text-xl text-paper-faint">3</span>
              <p className="leading-relaxed">
                Create an account to save it. Your sessions build a private history you
                can read back later, and share only if you choose to.
              </p>
            </li>
          </ol>
        </section>

        <section className="mt-16 rounded-2xl border border-ink-700 bg-ink-900/60 p-6">
          <h2 className="font-serif text-xl">A note on what this is not</h2>
          <p className="mt-3 text-sm leading-relaxed text-paper-dim">
            {brand.name} is a reflection tool, not therapy, counselling or medical
            advice. The questions are general ones about work and life direction. If
            you are going through something serious, please talk to a professional —
            this is not a substitute for one.
          </p>
        </section>

        <footer className="mt-20 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink-700 pt-8 text-sm text-paper-faint">
          <span>© {new Date().getFullYear()} {brand.name}</span>
          <Link href="/privacy" className="transition-colors hover:text-paper">
            Privacy
          </Link>
          <Link href="/reflect" className="transition-colors hover:text-paper">
            Start a session
          </Link>
        </footer>
      </main>
    </>
  )
}
