import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Refreshes the Supabase auth cookie on navigation so Server Components see
 * a valid session. Deliberately does no route protection — every page here
 * is either public or checks ownership itself.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  try {
    await supabase.auth.getUser()
  } catch {
    // A failed refresh should never 500 a page render.
  }

  return response
}

export const config = {
  matcher: [
    // Everything except static assets and image routes.
    '/((?!_next/static|_next/image|favicon.ico|api/card|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
