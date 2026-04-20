'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldAlert, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    
    // Check if user already exists (Supabase returns user with identities = [] for existing users)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('An account with this email already exists. Please sign in instead.')
      setLoading(false)
      return
    }
    
    setSuccess(true)
    setLoading(false)
  }
  
  async function handleResendConfirmation() {
    setResending(true)
    setError(null)
    
    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      setError(error.message)
    }
    setResending(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-2 text-2xl font-black text-foreground">Check your email.</h1>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>.
            Click it to activate your account.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {"Didn't receive the email? Check your spam folder or"}
          </p>
          <Button 
            variant="ghost" 
            onClick={handleResendConfirmation}
            disabled={resending}
            className="mt-2 w-full text-primary hover:text-primary/80"
          >
            {resending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              'Resend confirmation email'
            )}
          </Button>
          <Link href="/auth/login" className="mt-4 block">
            <Button variant="outline" className="w-full border-border">
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="mb-6 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Free &amp; anonymous
            </span>
          </div>

          <h1 className="mb-1 text-2xl font-black text-foreground">Create an account.</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Your email is only used to log in. Your posts are always anonymous.
          </p>

          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-input border-border"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="min. 6 characters"
                minLength={6}
                required
                className="bg-input border-border"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By signing up you agree to report real incidents, not fabricated ones.
        </p>
      </div>
    </div>
  )
}
