import { Post, getCategoryInfo } from '@/lib/types'
import { ChevronUp } from 'lucide-react'
import Link from 'next/link'

interface RankingPanelProps {
  title: string
  posts: Post[]
  period: 'weekly' | 'monthly'
}

export function RankingPanel({ title, posts, period }: RankingPanelProps) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
        <span className={`h-2 w-2 rounded-full ${period === 'weekly' ? 'bg-accent' : 'bg-primary'}`} />
        {title}
      </h3>
      <ol className="flex flex-col gap-2">
        {posts.length === 0 && (
          <li className="rounded-lg border border-border bg-card px-3 py-4 text-center text-xs text-muted-foreground">
            No reports yet this period.
          </li>
        )}
        {posts.map((post, i) => {
          const category = getCategoryInfo(post.category)
          return (
            <li key={post.id}>
              <Link
                href={`/post/${post.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-all hover:border-primary/40"
              >
                <span className="w-5 text-center text-xs font-black text-muted-foreground">
                  {i + 1}
                </span>
                <span
                  className={`h-2 w-2 flex-shrink-0 rounded-full ${category.color}`}
                />
                <span className="flex-1 truncate text-sm font-medium text-foreground">
                  {post.title}
                </span>
                <span className="flex items-center gap-0.5 text-xs font-bold text-primary">
                  <ChevronUp className="h-3 w-3" />
                  {post.vote_count.toLocaleString()}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
