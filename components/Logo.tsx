type LogoProps = {
  className?: string
  size?: number
}

/** Shipped mark: clay ring, inner arc breaking out (exhale). */
export function LogoMark({ className, size = 28 }: LogoProps) {
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
        <linearGradient id="il-exhale-gloss" x1="18" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff8ee" />
          <stop offset="0.45" stopColor="#e8e2d6" />
          <stop offset="1" stopColor="#c9c2b4" />
        </linearGradient>
        <filter id="il-exhale-drop" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="1.1" dy="2.4" stdDeviation="1.5" floodColor="#050508" floodOpacity="0.55" />
        </filter>
        <filter id="il-exhale-plump" x="-30%" y="-30%" width="160%" height="160%">
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
      </defs>
      <circle
        cx="32"
        cy="33.2"
        r="21"
        stroke="#1a1a22"
        strokeWidth="7.2"
        opacity="0.35"
        filter="url(#il-exhale-drop)"
      />
      <circle
        cx="32"
        cy="32"
        r="21"
        stroke="url(#il-exhale-gloss)"
        strokeWidth="7.2"
        strokeLinecap="round"
        strokeDasharray="112.4 19.6"
        transform="rotate(-38 32 32)"
        filter="url(#il-exhale-plump)"
      />
      <path
        d="M23 39.2 C21.6 29.4 27.8 21.8 36.2 22.4 C42.6 22.9 47.2 21.2 52.4 17.6"
        stroke="#8b8cf0"
        strokeWidth="6.4"
        strokeLinecap="round"
        filter="url(#il-exhale-drop)"
      />
      <path
        d="M23.4 38.2 C22.2 29.6 28.2 22.6 36 23.1 C41.8 23.5 46.4 21.8 51.2 18.4"
        stroke="#c5c6fa"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}

/** Flat mark for OG / Satori — no filters. */
export function LogoMarkFlat({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
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
  )
}
