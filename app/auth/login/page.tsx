'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // Provide more helpful error messages
      if (error.message.includes('Email not confirmed')) {
        setError('Your email is not confirmed yet. Please check your inbox and click the confirmation link, or sign up again to receive a new link.')
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      // Force a hard navigation to ensure cookies are properly read by server
      window.location.href = '/'
    }
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
              Anonymous sign-in
            </span>
          </div>

          <h1 className="mb-1 text-2xl font-black text-foreground">Welcome back.</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Sign in to report fuck-ups. Your identity is never shown publicly.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                placeholder="••••••••"
                required
                className="bg-input border-border"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            
            <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors self-end -mt-2">
              Forgot password?
            </Link>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your email is used only to authenticate. It is never shown publicly.
        </p>
      </div>
    </div>
  )
}
