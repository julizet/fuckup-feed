'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [sessionValid, setSessionValid] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setSessionValid(!!session)
    }
    checkSession()
  }, [])

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (sessionValid === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!sessionValid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="mb-2 text-2xl font-black text-foreground">Invalid or expired link</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/auth/forgot-password" className="mt-6 block">
            <Button variant="outline" className="w-full border-border">
              Request new link
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-2 text-2xl font-black text-foreground">Password updated!</h1>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully updated.
          </p>
          <Button 
            onClick={() => router.push('/')} 
            className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go to Feed
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="mb-6 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              New Password
            </span>
          </div>

          <h1 className="mb-1 text-2xl font-black text-foreground">Set a new password.</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter your new password below.
          </p>

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                New Password
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="repeat password"
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
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
