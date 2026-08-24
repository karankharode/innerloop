import { ImageResponse } from 'next/og'
import { brand } from '@/lib/brand'
import { truncate } from '@/lib/summary'
import { accentHex } from '@/lib/client-types'
import type { SessionSummary } from '@/lib/database.types'

export const CARD_WIDTH = 1200
export const CARD_HEIGHT = 630

/**
 * The share card. One renderer, two consumers: the download button on the
 * results screen and the OpenGraph image on a public share page — so what
 * someone downloads is exactly what unfurls in a timeline.
 *
 * next/og runs a subset of CSS: flexbox only, no gap shorthand quirks, and
 * every text node needs an explicit display. Keep it boring.
 */
export function renderCard(
  summary: SessionSummary,
  opts: { accent?: string; name?: string | null; dateLabel?: string } = {},
) {
  const accent = accentHex(opts.accent ?? 'indigo')
  const stats: { value: string; label: string }[] = [
    { value: String(summary.answered), label: 'questions answered' },
    { value: String(summary.words), label: 'words written' },
    { value: String(summary.themes.length), label: 'themes explored' },
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0b0b0f',
          color: '#f4f1ea',
          padding: '56px 72px 60px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Accent rule */}
        <div
          style={{
            display: 'flex',
            width: 96,
            height: 6,
            borderRadius: 3,
            backgroundColor: accent,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 26,
              color: '#b6b2ab',
              letterSpacing: 1,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
              <circle
                cx="32"
                cy="32"
                r="21"
                stroke="#e8e2d6"
                strokeWidth="7.2"
                strokeLinecap="round"
                strokeDasharray="112.4 19.6"
                transform="rotate(-38 32 32)"
              />
              <path
                d="M23 39.2 C21.6 29.4 27.8 21.8 36.2 22.4 C42.6 22.9 47.2 21.2 52.4 17.6"
                stroke="#8b8cf0"
                strokeWidth="6.4"
                strokeLinecap="round"
              />
            </svg>
            <span style={{ display: 'flex', marginLeft: 10 }}>
              {opts.name ? `${opts.name} · ${brand.name}` : brand.name}
            </span>
          </div>
          {opts.dateLabel && (
            <div style={{ display: 'flex', fontSize: 22, color: '#7a7770' }}>{opts.dateLabel}</div>
          )}
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            marginTop: 30,
            fontSize: summary.headline.length > 60 ? 50 : 60,
            lineHeight: 1.14,
            maxWidth: 960,
            letterSpacing: -1,
          }}
        >
          {summary.headline}
        </div>

        {/* Highlight */}
        {summary.highlight && (
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              marginBottom: 36,
              paddingLeft: 24,
              borderLeft: `4px solid ${accent}`,
              fontSize: 25,
              lineHeight: 1.4,
              color: '#b6b2ab',
              maxWidth: 900,
            }}
          >
            {truncate(summary.highlight.answer, 130)}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', marginTop: 'auto', alignItems: 'flex-end', flexShrink: 0 }}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginRight: 64,
                borderTop: i === 0 ? `2px solid ${accent}` : '2px solid #24242f',
                paddingTop: 16,
                minWidth: 190,
              }}
            >
              <div style={{ display: 'flex', fontSize: 46, letterSpacing: -1 }}>{stat.value}</div>
              <div style={{ display: 'flex', fontSize: 20, color: '#7a7770', marginTop: 6 }}>
                {stat.label}
              </div>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginLeft: 'auto',
              alignItems: 'flex-end',
            }}
          >
            {summary.dominant_theme && (
              <div style={{ display: 'flex', fontSize: 24, color: accent }}>
                Mostly {summary.dominant_theme.title}
              </div>
            )}
            <div style={{ display: 'flex', fontSize: 22, color: '#7a7770', marginTop: 8 }}>
              {brand.domain}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: CARD_WIDTH, height: CARD_HEIGHT },
  )
}
