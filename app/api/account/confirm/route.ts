import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const token = searchParams.get('token')
  const action = searchParams.get('action')

  if (!token || !action || !['delete', 'reset'].includes(action)) {
    return NextResponse.redirect(new URL('/auth/error?message=Invalid+request', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Verify token
  const { data: actionData, error: fetchError } = await supabase
    .from('account_actions')
    .select('*')
    .eq('user_id', user.id)
    .eq('action_type', action)
    .eq('token', token)
    .single()

  if (fetchError || !actionData) {
    return NextResponse.redirect(new URL('/auth/error?message=Invalid+or+expired+token', request.url))
  }

  // Check expiry
  if (new Date(actionData.expires_at) < new Date()) {
    await supabase.from('account_actions').delete().eq('id', actionData.id)
    return NextResponse.redirect(new URL('/auth/error?message=Token+has+expired', request.url))
  }

  if (action === 'delete') {
    // Delete all user's posts first
    await supabase.from('posts').delete().eq('user_id', user.id)
    
    // Delete all user's votes
    await supabase.from('votes').delete().eq('user_id', user.id)
    
    // Delete the action token
    await supabase.from('account_actions').delete().eq('user_id', user.id)
    
    // Sign out the user
    await supabase.auth.signOut()
    
    // Delete the user account using admin API
    // Note: This requires service role key in production
    // For now, we'll redirect to a success page
    
    return NextResponse.redirect(new URL('/auth/account-deleted', request.url))
  } else if (action === 'reset') {
    // Delete all user's posts
    await supabase.from('posts').delete().eq('user_id', user.id)
    
    // Delete all user's votes
    await supabase.from('votes').delete().eq('user_id', user.id)
    
    // Delete the action token
    await supabase.from('account_actions').delete().eq('user_id', user.id)
    
    return NextResponse.redirect(new URL('/my-posts?reset=success', request.url))
  }

  return NextResponse.redirect(new URL('/', request.url))
}
