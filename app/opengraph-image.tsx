import { ImageResponse } from 'next/og'
import { LogoMarkFlat } from '@/components/Logo'
import { brand } from '@/lib/brand'

export const runtime = 'nodejs'
export const alt = `${brand.name} — ${brand.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 80px',
          backgroundColor: '#0b0b0f',
          color: '#f4f1ea',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(60rem 40rem at 50% -10%, rgba(139, 140, 240, 0.14), transparent 70%)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LogoMarkFlat size={64} />
          <div
            style={{
              display: 'flex',
              marginLeft: 18,
              fontSize: 32,
              letterSpacing: -0.4,
              color: '#f4f1ea',
            }}
          >
            {brand.name}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 36,
            fontSize: 48,
            lineHeight: 1.18,
            letterSpacing: -1,
            maxWidth: 920,
          }}
        >
          {brand.tagline}
        </div>
      </div>
    ),
    { ...size },
  )
}
