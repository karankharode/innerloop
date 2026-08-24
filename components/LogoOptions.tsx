import type { ReactNode } from 'react'
import {
  LogoExhale,
  LogoExhaleBulge,
  LogoExhaleSplit,
  LogoExhaleTight,
  LogoExhaleReach,
  LogoExhaleThick,
  LogoExhaleNorth,
  LogoExhaleMono,
} from '@/components/LogoExhale'

type MarkProps = { className?: string; size?: number }

function Frame({ className, size = 96, children }: MarkProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      {children}
    </svg>
  )
}

export function LogoOrbit({ className, size }: MarkProps) {
  return (
    <Frame className={className} size={size}>
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18.05" cy="17.55" r="4.2" stroke="currentColor" strokeWidth="1.7" />
    </Frame>
  )
}

export function LogoAperture({ className, size }: MarkProps) {
  return (
    <Frame className={className} size={size}>
      <circle
        cx="16"
        cy="16"
        r="10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeDasharray="55.4 7.4"
        transform="rotate(-28 16 16)"
      />
      <circle cx="16" cy="16" r="5.15" stroke="currentColor" strokeWidth="1.7" />
    </Frame>
  )
}

export function LogoSpiral({ className, size }: MarkProps) {
  return (
    <Frame className={className} size={size}>
      <path
        d="M16 6.2
           C24.8 6.2 25.9 14.1 25.9 16
           C25.9 24.7 19.2 25.8 16 25.8
           C8.4 25.8 7.2 19.1 7.2 16
           C7.2 10.4 11.6 8.6 16 8.6
           C21.2 8.6 22.4 12.9 22.4 16
           C22.4 20.2 19.1 21.6 16 21.6
           C13.4 21.6 12.2 19.2 12.2 16.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  )
}

export function LogoNest({ className, size }: MarkProps) {
  return (
    <Frame className={className} size={size}>
      <rect x="5.4" y="5.4" width="21.2" height="21.2" rx="7.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="10.15" y="10.15" width="11.7" height="11.7" rx="3.6" stroke="currentColor" strokeWidth="1.7" />
    </Frame>
  )
}

/** Outer sealed. Inner gap faces inward — you speak in here, nothing leaves. */
export function LogoChamber({ className, size }: MarkProps) {
  return (
    <Frame className={className} size={size}>
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.7" />
      <circle
        cx="16"
        cy="16"
        r="5.15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeDasharray="26.4 6"
        transform="rotate(130 16 16)"
      />
    </Frame>
  )
}

/** Nest as a room. Orbit as you, held inside. */
export function LogoHeld({ className, size }: MarkProps) {
  return (
    <Frame className={className} size={size}>
      <rect x="5.4" y="5.4" width="21.2" height="21.2" rx="7.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18.1" cy="17.7" r="4.15" stroke="currentColor" strokeWidth="1.7" />
    </Frame>
  )
}

/** Feelings spiral inward, trapped inside a closed ring. */
export function LogoInward({ className, size }: MarkProps) {
  return (
    <Frame className={className} size={size}>
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M16 9.4
           C22.2 9.4 23 14.1 23 16
           C23 21.4 18.9 22.4 16 22.4
           C11.5 22.4 10.6 18.8 10.6 16
           C10.6 13.4 13 12.4 16 12.4
           C18.8 12.4 19.5 14.5 19.5 16
           C19.5 18 18 18.8 16.1 18.8
           C14.6 18.8 14 17.5 14 16.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  )
}

/** Private page: closed frame, closed inner loop. */
export function LogoVault({ className, size }: MarkProps) {
  return (
    <Frame className={className} size={size}>
      <rect x="5.4" y="5.4" width="21.2" height="21.2" rx="7.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16" cy="16" r="4.35" stroke="currentColor" strokeWidth="1.7" />
    </Frame>
  )
}

/** Tiny private entrance at the bottom. Inner loop complete. */
export function LogoConfide({ className, size }: MarkProps) {
  return (
    <Frame className={className} size={size}>
      <rect
        x="5.4"
        y="5.4"
        width="21.2"
        height="21.2"
        rx="7.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeDasharray="78.2 6.4"
        pathLength="84.6"
        transform="rotate(180 16 16)"
      />
      <circle cx="16" cy="15.2" r="4.2" stroke="currentColor" strokeWidth="1.7" />
    </Frame>
  )
}

/** You are here. No broadcast. Outer world closed. */
export function LogoQuiet({ className, size }: MarkProps) {
  return (
    <Frame className={className} size={size}>
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16" cy="16" r="2.15" fill="currentColor" />
    </Frame>
  )
}

/** Exhale stays in the room. Outer sealed, inner breath mark. */
export function LogoBreath({ className, size }: MarkProps) {
  return (
    <Frame className={className} size={size}>
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12.2 18.4
           C12.2 14.2 14.6 12.6 16.6 12.6
           C18.8 12.6 20.2 14.2 20.2 16.1
           C20.2 18.4 18.4 19.5 16.8 19.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </Frame>
  )
}

/** Room you can open from the inside only. */
export function LogoSanctuary({ className, size }: MarkProps) {
  return (
    <Frame className={className} size={size}>
      <rect x="5.4" y="5.4" width="21.2" height="21.2" rx="7.2" stroke="currentColor" strokeWidth="1.7" />
      <rect
        x="10.15"
        y="10.15"
        width="11.7"
        height="11.7"
        rx="3.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeDasharray="41 5.4"
        transform="rotate(40 16 16)"
      />
    </Frame>
  )
}

export const KEEPER_OPTIONS = [
  {
    id: 'orbit',
    name: 'Orbit',
    note: 'Outer closed. Inner loop sits inside.',
    Mark: LogoOrbit,
  },
  {
    id: 'aperture',
    name: 'Aperture',
    note: 'Tiny gap, inner ring complete.',
    Mark: LogoAperture,
  },
  {
    id: 'spiral',
    name: 'Spiral',
    note: 'One line. Outer settles into inner.',
    Mark: LogoSpiral,
  },
  {
    id: 'nest',
    name: 'Nest',
    note: 'Rounded frame inside frame.',
    Mark: LogoNest,
  },
] as const

export const EXHALE_OPTIONS = [
  {
    id: 'exhale',
    name: 'Exhale',
    note: 'Clay ring. Inner arc breaks a gap and tries to get out.',
    Mark: LogoExhale,
  },
  {
    id: 'exhale-bulge',
    name: 'Exhale bulge',
    note: 'Clay membrane stretches. Feeling presses, not fully free.',
    Mark: LogoExhaleBulge,
  },
  {
    id: 'exhale-split',
    name: 'Exhale split',
    note: 'Wider split. Arc already outside — almost free.',
    Mark: LogoExhaleSplit,
  },
] as const

export const EXHALE_TWEAKS = [
  {
    id: 'exhale-tight',
    name: 'Tight',
    note: 'Smaller gap. Same break, quieter.',
    Mark: LogoExhaleTight,
  },
  {
    id: 'exhale-reach',
    name: 'Reach',
    note: 'Arc travels farther past the ring.',
    Mark: LogoExhaleReach,
  },
  {
    id: 'exhale-thick',
    name: 'Thick',
    note: 'Fatter clay. Stronger at favicon size.',
    Mark: LogoExhaleThick,
  },
  {
    id: 'exhale-north',
    name: 'North',
    note: 'Gap on top. Arc climbs out.',
    Mark: LogoExhaleNorth,
  },
  {
    id: 'exhale-mono',
    name: 'Mono',
    note: 'One color. Ring and breath both paper.',
    Mark: LogoExhaleMono,
  },
] as const

export const FEELING_OPTIONS = [
  {
    id: 'chamber',
    name: 'Chamber',
    note: 'World sealed. Inner gap faces in — talk here, nothing leaves.',
    Mark: LogoChamber,
  },
  {
    id: 'held',
    name: 'Held',
    note: 'Nest as room. Orbit as you, sitting inside.',
    Mark: LogoHeld,
  },
  {
    id: 'inward',
    name: 'Inward',
    note: 'Spiral trapped in a closed ring. Feelings go in, stay in.',
    Mark: LogoInward,
  },
  {
    id: 'vault',
    name: 'Vault',
    note: 'Closed page. Closed loop. Private notebook.',
    Mark: LogoVault,
  },
  {
    id: 'confide',
    name: 'Confide',
    note: 'Tiny bottom entrance. Inner loop complete.',
    Mark: LogoConfide,
  },
  {
    id: 'quiet',
    name: 'Quiet',
    note: 'You are here. No broadcast. Outer world closed.',
    Mark: LogoQuiet,
  },
  {
    id: 'breath',
    name: 'Breath',
    note: 'Exhale inside a sealed ring. Let it out, keep it here.',
    Mark: LogoBreath,
  },
  {
    id: 'sanctuary',
    name: 'Sanctuary',
    note: 'Outer room locked. Inner frame opens from the inside.',
    Mark: LogoSanctuary,
  },
] as const
