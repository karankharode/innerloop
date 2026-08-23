import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import ReflectionFlow from '@/components/ReflectionFlow'

export const metadata: Metadata = {
  title: 'A session',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default function ReflectPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-2xl px-5 pb-20 sm:px-8">
        <ReflectionFlow />
      </main>
    </>
  )
}
