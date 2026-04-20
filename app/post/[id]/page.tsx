import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { VoteButton } from '@/components/vote-button'
import { getCategoryInfo, Post } from '@/lib/types'
import { MapPin, Clock, ArrowLeft, Link2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

function getSessionId(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return cookieStore.get('fuf_session')?.value ?? 'anonymous'
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const sessionId = getSessionId(cookieStore)

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) notFound()

  // Check if voted
  const voteQuery = user
    ? supabase.from('votes').select('id').eq('post_id', id).eq('user_id', user.id)
    : supabase.from('votes').select('id').eq('post_id', id).eq('session_id', sessionId)

  const { data: voteData } = await voteQuery
  const userVoted = (voteData ?? []).length > 0

  const category = getCategoryInfo(post.category)
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>

        <article className="rounded-2xl border border-border bg-card p-6">
          {/* Category + meta */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold text-white ${category.color}`}>
              {category.label}
            </span>
            {post.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {post.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo}
            </span>
          </div>

          <h1 className="text-balance text-2xl font-black leading-tight text-foreground md:text-3xl">
            {post.title}
          </h1>

          {post.image_url && (
            <div className="mt-4 overflow-hidden rounded-xl">
              <Image
                src={post.image_url}
                alt={post.title}
                width={800}
                height={450}
                className="w-full object-cover"
              />
            </div>
          )}

          <p className="mt-4 leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {post.description}
          </p>

          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.hashtags.map((tag: string) => (
                <span key={tag} className="text-sm text-accent font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Vote + share */}
          <div className="mt-6 flex items-center gap-4 border-t border-border pt-5">
            <VoteButton
              postId={post.id}
              initialCount={post.vote_count}
              initialVoted={userVoted}
              sessionId={sessionId}
              userId={user?.id ?? null}
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">
                {post.vote_count.toLocaleString()} {post.vote_count === 1 ? 'vote' : 'votes'}
              </span>
              <span className="text-xs text-muted-foreground">Click to amplify this report</span>
            </div>
          </div>

          {/* Evidence note */}
          <div className="mt-4 rounded-lg border border-border bg-secondary/40 px-4 py-3">
            <div className="flex items-start gap-2">
              <Link2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                This report can be used as documentation in democratic or legal processes.
                Share the link to amplify visibility. All reports are permanently timestamped.
              </p>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}
