import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Navbar } from '@/components/navbar'
import { HeroBanner } from '@/components/hero-banner'
import { PostCard } from '@/components/post-card'
import { RankingPanel } from '@/components/ranking-panel'
import { CategoryFilter } from '@/components/category-filter'
import { Post } from '@/lib/types'
import { Suspense } from 'react'
import { Flame, Clock } from 'lucide-react'

function getSessionId(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  let sid = cookieStore.get('fuf_session')?.value
  return sid ?? 'anonymous'
}

interface PageProps {
  searchParams: Promise<{ category?: string; sort?: string }>
}

async function getVotedPostIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string | null,
  sessionId: string,
): Promise<Set<string>> {
  const query = userId
    ? supabase.from('votes').select('post_id').eq('user_id', userId)
    : supabase.from('votes').select('post_id').eq('session_id', sessionId)

  const { data } = await query
  return new Set((data ?? []).map((v: { post_id: string }) => v.post_id))
}

export default async function HomePage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const sessionId = getSessionId(cookieStore)
  const { category, sort = 'trending' } = await searchParams

  // Voted post ids for highlighting
  const votedIds = await getVotedPostIds(supabase, user?.id ?? null, sessionId)

  // Main feed
  let feedQuery = supabase
    .from('posts')
    .select('*')

  if (category) {
    feedQuery = feedQuery.eq('category', category)
  }

  if (sort === 'recent') {
    feedQuery = feedQuery.order('created_at', { ascending: false })
  } else {
    feedQuery = feedQuery.order('vote_count', { ascending: false })
  }

  feedQuery = feedQuery.limit(20)
  const { data: rawPosts } = await feedQuery
  const posts: Post[] = (rawPosts ?? []).map((p: Post) => ({
    ...p,
    user_voted: votedIds.has(p.id),
  }))

  // Weekly ranking (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: weeklyRaw } = await supabase
    .from('posts')
    .select('*')
    .gte('created_at', weekAgo)
    .order('vote_count', { ascending: false })
    .limit(5)
  const weeklyPosts: Post[] = weeklyRaw ?? []

  // Monthly ranking (last 30 days)
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: monthlyRaw } = await supabase
    .from('posts')
    .select('*')
    .gte('created_at', monthAgo)
    .order('vote_count', { ascending: false })
    .limit(5)
  const monthlyPosts: Post[] = monthlyRaw ?? []

  // Stats
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
  const { data: voteSum } = await supabase
    .from('posts')
    .select('vote_count')
  const totalVotes = (voteSum ?? []).reduce((acc: number, p: { vote_count: number }) => acc + (p.vote_count ?? 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <HeroBanner
          isLoggedIn={!!user}
          totalPosts={totalPosts ?? 0}
          totalVotes={totalVotes}
        />

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Feed column */}
          <section id="trending" className="flex-1 min-w-0">
            {/* Sort + filter */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
                <SortTab href="/?sort=trending" active={sort !== 'recent'} icon={<Flame className="h-3.5 w-3.5" />} label="Trending" />
                <SortTab href="/?sort=recent" active={sort === 'recent'} icon={<Clock className="h-3.5 w-3.5" />} label="Recent" />
              </div>
            </div>

            <Suspense>
              <CategoryFilter />
            </Suspense>

            <div className="mt-4 flex flex-col gap-4">
              {posts.length === 0 && (
                <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
                  <p className="text-lg font-bold text-foreground">No fuck-ups reported yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Be the first to report one — sign in and submit.
                  </p>
                </div>
              )}
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  sessionId={sessionId}
                  userId={user?.id ?? null}
                />
              ))}
            </div>
          </section>

          {/* Sidebar rankings */}
          <aside id="rankings" className="w-full lg:w-72 flex flex-col gap-8 lg:sticky lg:top-20">
            <RankingPanel title="Top This Week" posts={weeklyPosts} period="weekly" />
            <RankingPanel title="Top This Month" posts={monthlyPosts} period="monthly" />

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                About
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                FuckUp Feed is a 100% anonymous platform for people to report and amplify daily
                experiences of discrimination, injustice, and misconduct. Documented reports can
                serve as evidence in democratic or legal processes.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                No personal data is stored. No tracking. No ads. <a href="/imprint" className="underline hover:text-foreground transition-colors">Imprint</a>.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function SortTab({
  href,
  active,
  icon,
  label,
}: {
  href: string
  active: boolean
  icon: React.ReactNode
  label: string
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </a>
  )
}
