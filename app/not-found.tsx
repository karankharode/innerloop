import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col justify-center px-5 text-center">
      <h1 className="font-serif text-3xl">Nothing here</h1>
      <p className="mt-3 text-paper-dim">
        This page does not exist, or it belongs to someone else. Sessions are private
        unless their owner publishes them.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/reflect"
          className="rounded-full bg-paper px-7 py-3.5 font-medium text-ink-950"
        >
          Start a session
        </Link>
        <Link href="/" className="text-sm text-paper-faint hover:text-paper">
          Back to the start
        </Link>
      </div>
    </main>
  )
}
