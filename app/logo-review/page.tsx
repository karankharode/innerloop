import type { ComponentType } from 'react'
import { brand } from '@/lib/brand'
import { EXHALE_OPTIONS, EXHALE_TWEAKS, FEELING_OPTIONS, KEEPER_OPTIONS } from '@/components/LogoOptions'

export const metadata = {
  title: 'Logo options',
  robots: { index: false, follow: false },
}

function Grid({
  items,
}: {
  items: readonly {
    id: string
    name: string
    note: string
    Mark: ComponentType<{ size?: number; className?: string }>
  }[]
}) {
  return (
    <div className="mt-8 grid gap-10 sm:grid-cols-2">
      {items.map(({ id, name, note, Mark }) => (
        <article key={id} className="rounded-2xl border border-ink-700 bg-ink-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">{name}</h2>
            <code className="text-xs text-paper-faint">{id}</code>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-paper-dim">{note}</p>

          <div className="mt-6 flex items-end gap-6 text-paper">
            <Mark size={96} />
            <Mark size={48} />
            <Mark size={22} />
          </div>

          <div className="mt-6 flex items-center gap-2.5 border-t border-ink-700 pt-5">
            <Mark size={22} />
            <span className="font-serif text-lg tracking-tight">{brand.name}</span>
          </div>

          <div className="mt-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-950 text-paper">
            <Mark size={36} />
          </div>
        </article>
      ))}
    </div>
  )
}

export default function LogoReviewPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
      <p className="text-sm uppercase tracking-[0.2em] text-paper-faint">Review</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">Logo options</h1>
      <p className="mt-4 max-w-2xl text-paper-dim">
        Talk here. No one reading. Free, secure, let feelings out. Nothing ships until
        you pick.
      </p>

      <h2 className="mt-14 font-serif text-2xl">This pass — clay exhale</h2>
      <p className="mt-2 max-w-2xl text-sm text-paper-dim">
        Soft clay ring. Inner arc tries to break through and escape.
      </p>
      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        {EXHALE_OPTIONS.map(({ id, name, note, Mark }) => (
          <article key={id} className="rounded-2xl border border-ink-700 bg-ink-900 p-6">
            <h2 className="font-serif text-2xl">{name}</h2>
            <code className="text-xs text-paper-faint">{id}</code>
            <p className="mt-2 text-sm leading-relaxed text-paper-dim">{note}</p>
            <div className="mt-6 flex justify-center text-paper">
              <Mark size={168} />
            </div>
            <div className="mt-6 flex items-center justify-center gap-2.5 border-t border-ink-700 pt-5">
              <Mark size={28} />
              <span className="font-serif text-lg tracking-tight">{brand.name}</span>
            </div>
          </article>
        ))}
      </div>

      <h2 className="mt-16 font-serif text-2xl">Exhale tweaks</h2>
      <p className="mt-2 max-w-2xl text-sm text-paper-dim">
        Shipped mark is `exhale`. These nudge gap, reach, weight, direction, color.
      </p>
      <Grid items={EXHALE_TWEAKS} />

      <h2 className="mt-16 font-serif text-2xl">Kept from last pass</h2>
      <Grid items={KEEPER_OPTIONS} />

      <h2 className="mt-16 font-serif text-2xl">New — private room</h2>
      <p className="mt-2 max-w-2xl text-sm text-paper-dim">
        Sealed outer. Inner space for you. Mix with keepers if you want.
      </p>
      <Grid items={FEELING_OPTIONS} />
    </main>
  )
}
