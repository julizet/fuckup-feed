import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Post, CATEGORIES } from '@/lib/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUp, MapPin, Trash2, LayoutList } from 'lucide-react'
import { DeletePostButton } from '@/components/delete-post-button'
import { AccountActions } from '@/components/account-actions'

const DAILY_POST_LIMIT = 3

export default async function MyPostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: rawPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const posts: Post[] = rawPosts ?? []
  
  // Calculate posts made today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const postsToday = posts.filter(post => new Date(post.created_at) >= today).length
  const remainingToday = Math.max(0, DAILY_POST_LIMIT - postsToday)

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* Account Actions */}
        <AccountActions userEmail={user.email ?? ''} />
        
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutList className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-black text-foreground">My Fuckups</h1>
              <p className="text-sm text-muted-foreground">
                {posts.length === 0
                  ? 'You have not reported anything yet.'
                  : `${posts.length} report${posts.length === 1 ? '' : 's'} submitted anonymously.`}
              </p>
            </div>
          </div>
          
          {/* Daily limit counter */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-primary">{remainingToday}</span>
              <span className="text-sm text-muted-foreground">/ {DAILY_POST_LIMIT}</span>
            </div>
            <p className="text-xs text-muted-foreground">posts left today</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-8 py-16 text-center">
            <p className="text-base font-bold text-muted-foreground">Nothing here yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              When you submit a fuck-up report it will appear here.
            </p>
            <Link
              href="/submit"
              className="mt-4 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Report a Fuck-Up
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map(post => {
              const cat = CATEGORIES.find(c => c.value === post.category)
              return (
                <div
                  key={post.id}
                  className="group relative rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  {/* Category badge */}
                  <div className="mb-2 flex items-center gap-2">
                    {cat && (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${cat.color}`}>
                        {cat.label}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                    <div className="ml-auto flex items-center gap-1 text-xs font-bold text-muted-foreground">
                      <ArrowUp className="h-3.5 w-3.5" />
                      {post.vote_count}
                    </div>
                  </div>

                  {/* Title */}
                  <Link href={`/post/${post.id}`}>
                    <h2 className="text-base font-black leading-snug text-foreground hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Description preview */}
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>

                  {/* Location */}
                  {post.location && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {post.location}
                    </div>
                  )}

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {post.hashtags.map(tag => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary/20 border border-primary/40 px-2.5 py-0.5 text-xs font-semibold text-primary"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Delete */}
                  <div className="mt-4 flex justify-end">
                    <DeletePostButton postId={post.id} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
