'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2, KeyRound, AlertTriangle, Mail, Loader2 } from 'lucide-react'
import { getSiteUrl } from '@/lib/utils/site-url'

interface AccountActionsProps {
  userEmail: string
}

export function AccountActions({ userEmail }: AccountActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDeleteAccount() {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to initiate account deletion')
      }
      
      setSuccess('We sent a confirmation email to ' + userEmail + '. Click the link to permanently delete your account.')
      setShowDeleteConfirm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    setResetLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${getSiteUrl()}/auth/reset-password`,
      })
      
      if (error) throw error
      
      setSuccess('We sent a password reset link to ' + userEmail + '. Click the link to set a new password.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setResetLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Check your email</p>
            <p className="mt-1 text-sm text-muted-foreground">{success}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-bold text-foreground mb-3">Hello, Anonymous</h3>
      
      {error && (
        <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {!showDeleteConfirm ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetPassword}
            disabled={resetLoading}
            className="gap-2 border-border hover:border-primary hover:text-primary"
          >
            {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Reset Password
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="gap-2 border-border hover:border-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Delete your account?</p>
              <p className="text-xs text-muted-foreground mt-1">
                This will permanently delete your account and all your posts. This action cannot be undone. You will receive a confirmation email.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAccount}
              disabled={loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send Confirmation Email
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
