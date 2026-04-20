import Link from 'next/link'
import { ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AccountDeletedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        
        <h1 className="mt-6 text-2xl font-black text-foreground">Account Deleted</h1>
        
        <p className="mt-3 text-sm text-muted-foreground">
          Your account and all associated data have been permanently deleted. 
          We&apos;re sorry to see you go.
        </p>
        
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full">
              Return to Home
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button variant="outline" className="w-full">
              Create New Account
            </Button>
          </Link>
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>This action cannot be undone</span>
        </div>
      </div>
    </div>
  )
}
