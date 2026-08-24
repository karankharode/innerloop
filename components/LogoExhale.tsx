'use client'

import { useId, type ReactNode } from 'react'

type MarkProps = { className?: string; size?: number }

function ClaySvg({
  className,
  size = 96,
  children,
}: MarkProps & { children: (ids: { drop: string; plump: string; gloss: string }) => ReactNode }) {
  const raw = useId().replace(/:/g, '')
  const ids = {
    drop: `${raw}-drop`,
    plump: `${raw}-plump`,
    gloss: `${raw}-gloss`,
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
    >
      <defs>
        <filter id={ids.drop} x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="1.1" dy="2.4" stdDeviation="1.5" floodColor="#050508" floodOpacity="0.55" />
        </filter>
        <filter id={ids.plump} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="blur" />
          <feOffset in="blur" dx="0.9" dy="1.4" result="off" />
          <feComposite in="off" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner" />
          <feColorMatrix
            in="inner"
            type="matrix"
            values="0 0 0 0 0.06  0 0 0 0 0.06  0 0 0 0 0.09  0 0 0 0.45 0"
            result="shadow"
          />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="shadow" />
          </feMerge>
        </filter>
        <linearGradient id={ids.gloss} x1="18" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff8ee" />
          <stop offset="0.45" stopColor="#e8e2d6" />
          <stop offset="1" stopColor="#c9c2b4" />
        </linearGradient>
      </defs>
      {children(ids)}
    </svg>
  )
}

/** Inner arc rips a gap and pokes through the clay ring. */
export function LogoExhale({ className, size }: MarkProps) {
  return (
    <ClaySvg className={className} size={size}>
      {(ids) => (
        <>
          <circle
            cx="32"
            cy="33.2"
            r="21"
            stroke="#1a1a22"
            strokeWidth="7.2"
            opacity="0.35"
            filter={`url(#${ids.drop})`}
          />
          <circle
            cx="32"
            cy="32"
            r="21"
            stroke={`url(#${ids.gloss})`}
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeDasharray="112.4 19.6"
            transform="rotate(-38 32 32)"
            filter={`url(#${ids.plump})`}
          />
          <path
            d="M23 39.2
               C21.6 29.4 27.8 21.8 36.2 22.4
               C42.6 22.9 47.2 21.2 52.4 17.6"
            stroke="#8b8cf0"
            strokeWidth="6.4"
            strokeLinecap="round"
            filter={`url(#${ids.drop})`}
          />
          <path
            d="M23.4 38.2
               C22.2 29.6 28.2 22.6 36 23.1
               C41.8 23.5 46.4 21.8 51.2 18.4"
            stroke="#c5c6fa"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </>
      )}
    </ClaySvg>
  )
}

/** Outer clay stretches — feeling presses the wall, not fully out. */
export function LogoExhaleBulge({ className, size }: MarkProps) {
  return (
    <ClaySvg className={className} size={size}>
      {(ids) => (
        <>
          <ellipse
            cx="33.4"
            cy="31.4"
            rx="22.6"
            ry="20.4"
            transform="rotate(-28 33.4 31.4)"
            stroke={`url(#${ids.gloss})`}
            strokeWidth="7.2"
            filter={`url(#${ids.plump})`}
          />
          <path
            d="M24.2 38.8
               C22.4 30 28.6 23.2 36.8 23.6
               C43.4 24 48.8 22.2 53.6 18.2"
            stroke="#8b8cf0"
            strokeWidth="6.2"
            strokeLinecap="round"
            filter={`url(#${ids.drop})`}
          />
          <path
            d="M24.6 37.8
               C23.2 30.2 28.8 24 36.6 24.4
               C42.6 24.7 47.6 23 51.8 19.4"
            stroke="#d0d1fc"
            strokeWidth="2.1"
            strokeLinecap="round"
            opacity="0.8"
          />
        </>
      )}
    </ClaySvg>
  )
}

/** Wider split. Arc already outside — almost free. */
export function LogoExhaleSplit({ className, size }: MarkProps) {
  return (
    <ClaySvg className={className} size={size}>
      {(ids) => (
        <>
          <circle
            cx="32"
            cy="32"
            r="21"
            stroke={`url(#${ids.gloss})`}
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeDasharray="100 32"
            transform="rotate(-42 32 32)"
            filter={`url(#${ids.plump})`}
          />
          <path
            d="M22.8 38.6
               C21.2 28.4 29.4 21.2 38.2 22.8
               C45.4 24.1 50.6 20.4 55.8 15.6"
            stroke="#8b8cf0"
            strokeWidth="6.4"
            strokeLinecap="round"
            filter={`url(#${ids.drop})`}
          />
          <path
            d="M23.4 37.6
               C22.2 28.8 29.6 22.2 38 23.6
               C44.6 24.8 49.6 21.2 54.4 16.8"
            stroke="#d4d5fd"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </>
      )}
    </ClaySvg>
  )
}

/** Smaller gap. Arc still leaks, quieter. */
export function LogoExhaleTight({ className, size }: MarkProps) {
  return (
    <ClaySvg className={className} size={size}>
      {(ids) => (
        <>
          <circle
            cx="32"
            cy="32"
            r="21"
            stroke={`url(#${ids.gloss})`}
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeDasharray="118.8 13.2"
            transform="rotate(-38 32 32)"
            filter={`url(#${ids.plump})`}
          />
          <path
            d="M23.4 38.8 C22 29.6 28 22.4 36 23 C41.8 23.5 46 21.8 50.2 18.8"
            stroke="#8b8cf0"
            strokeWidth="6.2"
            strokeLinecap="round"
            filter={`url(#${ids.drop})`}
          />
          <path
            d="M23.8 37.8 C22.6 29.8 28.4 23.2 36 23.7 C41.4 24.1 45.4 22.4 49.4 19.6"
            stroke="#c5c6fa"
            strokeWidth="2.1"
            strokeLinecap="round"
            opacity="0.85"
          />
        </>
      )}
    </ClaySvg>
  )
}

/** Arc reaches farther past the ring. */
export function LogoExhaleReach({ className, size }: MarkProps) {
  return (
    <ClaySvg className={className} size={size}>
      {(ids) => (
        <>
          <circle
            cx="32"
            cy="32"
            r="21"
            stroke={`url(#${ids.gloss})`}
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeDasharray="108 24"
            transform="rotate(-38 32 32)"
            filter={`url(#${ids.plump})`}
          />
          <path
            d="M22.6 39.6 C20.8 28.6 28.2 20.6 37 21.6 C45 22.6 51.4 19.4 58 14.2"
            stroke="#8b8cf0"
            strokeWidth="6.4"
            strokeLinecap="round"
            filter={`url(#${ids.drop})`}
          />
          <path
            d="M23.2 38.6 C21.6 29 28.6 21.6 36.8 22.5 C44.4 23.4 50.4 20.4 56.4 15.4"
            stroke="#c5c6fa"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </>
      )}
    </ClaySvg>
  )
}

/** Fatter clay. Reads at 16px tabs. */
export function LogoExhaleThick({ className, size }: MarkProps) {
  return (
    <ClaySvg className={className} size={size}>
      {(ids) => (
        <>
          <circle
            cx="32"
            cy="32"
            r="20"
            stroke={`url(#${ids.gloss})`}
            strokeWidth="8.8"
            strokeLinecap="round"
            strokeDasharray="104 21.6"
            transform="rotate(-38 32 32)"
            filter={`url(#${ids.plump})`}
          />
          <path
            d="M23 39 C21.6 29.4 27.8 21.8 36.2 22.4 C42.6 22.9 47.2 21.2 52.4 17.6"
            stroke="#8b8cf0"
            strokeWidth="7.6"
            strokeLinecap="round"
            filter={`url(#${ids.drop})`}
          />
          <path
            d="M23.6 37.8 C22.4 29.4 28.4 22.8 36 23.3 C41.8 23.7 46.2 22 50.8 18.6"
            stroke="#c5c6fa"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.8"
          />
        </>
      )}
    </ClaySvg>
  )
}

/** Gap at 12 o'clock. Arc climbs out the top. */
export function LogoExhaleNorth({ className, size }: MarkProps) {
  return (
    <ClaySvg className={className} size={size}>
      {(ids) => (
        <>
          <circle
            cx="32"
            cy="32"
            r="21"
            stroke={`url(#${ids.gloss})`}
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeDasharray="112.4 19.6"
            transform="rotate(-90 32 32)"
            filter={`url(#${ids.plump})`}
          />
          <path
            d="M24.2 40 C22.4 30.4 26.8 22.2 32.2 20.2 C36.6 18.6 40.2 16.2 42.4 10.8"
            stroke="#8b8cf0"
            strokeWidth="6.4"
            strokeLinecap="round"
            filter={`url(#${ids.drop})`}
          />
          <path
            d="M24.8 38.8 C23.2 30.2 27.4 22.8 32.2 21 C36.2 19.5 39.4 17.2 41.4 12.2"
            stroke="#c5c6fa"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </>
      )}
    </ClaySvg>
  )
}

/** Paper ring + paper arc. One color. */
export function LogoExhaleMono({ className, size }: MarkProps) {
  return (
    <ClaySvg className={className} size={size}>
      {(ids) => (
        <>
          <circle
            cx="32"
            cy="32"
            r="21"
            stroke={`url(#${ids.gloss})`}
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeDasharray="112.4 19.6"
            transform="rotate(-38 32 32)"
            filter={`url(#${ids.plump})`}
          />
          <path
            d="M23 39.2 C21.6 29.4 27.8 21.8 36.2 22.4 C42.6 22.9 47.2 21.2 52.4 17.6"
            stroke="#f4f1ea"
            strokeWidth="6.4"
            strokeLinecap="round"
            filter={`url(#${ids.drop})`}
          />
        </>
      )}
    </ClaySvg>
  )
}
