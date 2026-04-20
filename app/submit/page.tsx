import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { SubmitForm } from '@/components/submit-form'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

const DAILY_POST_LIMIT = 3

export default async function SubmitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check daily post limit
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())
  
  const postsToday = count ?? 0
  const remainingToday = Math.max(0, DAILY_POST_LIMIT - postsToday)
  const canPost = remainingToday > 0

  if (!canPost) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-2xl font-black text-foreground">Daily Limit Reached</h1>
            <p className="mt-2 text-muted-foreground">
              You have already posted {DAILY_POST_LIMIT} fuckups today. Come back tomorrow to share more!
            </p>
            <Link
              href="/my-posts"
              className="mt-6 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View My Fuckups
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-foreground">Report a Fuck-Up</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Your identity is never revealed. Posts are 100% anonymous.
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-primary">{remainingToday}</span>
                <span className="text-sm text-muted-foreground">/ {DAILY_POST_LIMIT}</span>
              </div>
              <p className="text-xs text-muted-foreground">left today</p>
            </div>
          </div>
        </div>
        <SubmitForm userId={user.id} />
      </main>
    </div>
  )
}
