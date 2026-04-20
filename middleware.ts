import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Assign anonymous session ID for vote tracking (non-logged-in users)
  // Use Web Crypto API (globalThis.crypto) — Node's crypto module is not available in Edge runtime
  if (!request.cookies.get('fuf_session')) {
    const sessionId = globalThis.crypto.randomUUID()
    const res = response instanceof NextResponse ? response : NextResponse.next()
    res.cookies.set('fuf_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    })
    return res
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
