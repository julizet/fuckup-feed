import { Post, getCategoryInfo } from '@/lib/types'
import { VoteButton } from '@/components/vote-button'
import { MapPin, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

interface PostCardProps {
  post: Post
  sessionId: string
  userId: string | null
  rank?: number
}

export function PostCard({ post, sessionId, userId, rank }: PostCardProps) {
  const category = getCategoryInfo(post.category)
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <article className="group relative flex gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40">
      {rank && (
        <div className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-black text-accent-foreground">
          #{rank}
        </div>
      )}

      {/* Vote column */}
      <div className="flex flex-shrink-0 flex-col items-center">
        <VoteButton
          postId={post.id}
          initialCount={post.vote_count}
          initialVoted={post.user_voted ?? false}
          sessionId={sessionId}
          userId={userId}
        />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${category.color}`}>
            {category.label}
          </span>
          {post.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {post.location}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>

        <Link href={`/post/${post.id}`} className="group/title">
          <h2 className="text-balance font-bold leading-snug text-foreground group-hover/title:text-primary transition-colors">
            {post.title}
          </h2>
        </Link>

        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {post.description}
        </p>

        {post.image_url && (
          <Link href={`/post/${post.id}`} className="mt-1 block overflow-hidden rounded-lg">
            <Image
              src={post.image_url}
              alt={post.title}
              width={640}
              height={360}
              className="h-48 w-full object-cover transition-transform group-hover:scale-[1.01]"
            />
          </Link>
        )}

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {post.hashtags.map(tag => (
              <span key={tag} className="text-xs text-accent font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
