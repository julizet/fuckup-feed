import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { SubmitForm } from '@/components/submit-form'

export default async function SubmitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">Report a Fuck-Up</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your identity is never revealed. Posts are 100% anonymous.
          </p>
        </div>
        <SubmitForm userId={user.id} />
      </main>
    </div>
  )
}
