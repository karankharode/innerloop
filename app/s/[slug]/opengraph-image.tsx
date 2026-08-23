import { getPublicSession } from '@/lib/sessions'
import { renderCard, CARD_WIDTH, CARD_HEIGHT } from '@/lib/card'
import { accentForTheme } from '@/lib/theme-accent'
import { brand } from '@/lib/brand'

export const runtime = 'nodejs'
export const alt = `${brand.name} session`
export const size = { width: CARD_WIDTH, height: CARD_HEIGHT }
export const contentType = 'image/png'

/** The unfurl image for a public share link — the same card the owner downloads. */
export default async function Image({ params }: { params: { slug: string } }) {
  const result = await getPublicSession(params.slug)

  if (!result?.session.summary) {
    return renderCard(
      {
        answered: 0,
        skipped: 0,
        total: 0,
        words: 0,
        themes: [],
        dominant_theme: null,
        headline: brand.tagline,
        highlight: null,
        signature: [],
        generated_at: new Date().toISOString(),
      },
      {},
    )
  }

  return renderCard(result.session.summary, {
    accent: accentForTheme(result.session.summary.dominant_theme?.slug),
    name: result.displayName,
    dateLabel: result.session.completed_at
      ? new Date(result.session.completed_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : undefined,
  })
}
