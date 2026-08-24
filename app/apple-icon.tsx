import { ImageResponse } from 'next/og'
import { LogoMarkFlat } from '@/components/Logo'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0b0f',
          borderRadius: 40,
        }}
      >
        <LogoMarkFlat size={118} />
      </div>
    ),
    { ...size },
  )
}
