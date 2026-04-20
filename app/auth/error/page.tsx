import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h1 className="mb-2 text-2xl font-black text-foreground">Authentication error.</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {message || 'Something went wrong during sign-in. Please try again.'}
        </p>
        <Link href="/auth/login">
          <Button className="w-full bg-primary text-primary-foreground">Try again</Button>
        </Link>
      </div>
    </div>
  )
}
