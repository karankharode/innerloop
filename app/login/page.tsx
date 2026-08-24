import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import WaitlistForm from '@/components/WaitlistForm'
import { brand } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'What’s next',
  robots: { index: false, follow: false },
}

export default function WaitlistPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-md px-5 pb-24 sm:px-8">
        <div className="animate-rise pt-10 sm:pt-16">
          <h1 className="font-serif text-3xl">Hear what comes next</h1>
          <p className="mt-3 leading-relaxed text-paper-dim">
            {brand.name} is early. If you want a note when there is more to try, leave
            an email. That is all we collect here — no login, no password.
          </p>
          <WaitlistForm source="notify" />
        </div>
      </main>
    </>
  )
}
