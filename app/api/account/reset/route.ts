import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Generate a secure token for reset confirmation
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Store the token in the database
  const { error: tokenError } = await supabase
    .from('account_actions')
    .upsert({
      user_id: user.id,
      action_type: 'reset',
      token,
      expires_at: expiresAt.toISOString(),
    }, {
      onConflict: 'user_id,action_type'
    })

  if (tokenError) {
    console.error('Token storage error:', tokenError)
    return NextResponse.json({ error: 'Failed to initiate reset' }, { status: 500 })
  }

  // Send confirmation email
  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/account/confirm?token=${token}&action=reset`

  const { error: emailError } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: confirmUrl,
  })

  return NextResponse.json({ 
    success: true,
    message: 'Confirmation email sent. Please check your inbox.'
  })
}
