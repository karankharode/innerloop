'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#0b0b0f',
          color: '#f4f1ea',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          minHeight: '100dvh',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Something went wrong</h1>
          <p style={{ color: '#b6b2ab', marginBottom: '1.5rem' }}>
            The app failed to load. Reloading usually fixes it.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#f4f1ea',
              color: '#0b0b0f',
              border: 0,
              borderRadius: 999,
              padding: '0.85rem 1.75rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
          {error.digest && (
            <p style={{ color: '#7a7770', fontSize: '0.75rem', marginTop: '1.5rem' }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
