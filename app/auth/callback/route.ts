import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  // Handle error parameters from Supabase
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  if (error) {
    const errorUrl = new URL(`${origin}/auth/error`)
    errorUrl.searchParams.set('message', errorDescription || error)
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    const errorUrl = new URL(`${origin}/auth/error`)
    errorUrl.searchParams.set('message', exchangeError.message)
    return NextResponse.redirect(errorUrl)
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
