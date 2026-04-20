'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoteButtonProps {
  postId: string
  initialCount: number
  initialVoted: boolean
  sessionId: string
  userId: string | null
}

export function VoteButton({
  postId,
  initialCount,
  initialVoted,
  sessionId,
  userId,
}: VoteButtonProps) {
  const router = useRouter()
  const [count, setCount] = useState(initialCount)
  const [voted, setVoted] = useState(initialVoted)
  const [loading, setLoading] = useState(false)

  async function handleVote() {
    if (loading) return
    setLoading(true)

    const supabase = createClient()

    try {
      if (voted) {
        // Remove vote
        const query = userId
          ? supabase.from('votes').delete().eq('post_id', postId).eq('user_id', userId)
          : supabase.from('votes').delete().eq('post_id', postId).eq('session_id', sessionId)

        const { error } = await query
        if (!error) {
          await supabase.rpc('decrement_vote', { p_post_id: postId })
          setCount(c => Math.max(0, c - 1))
          setVoted(false)
        }
      } else {
        // Add vote
        const voteData = userId
          ? { post_id: postId, user_id: userId, session_id: null }
          : { post_id: postId, user_id: null, session_id: sessionId }

        const { error } = await supabase.from('votes').insert(voteData)
        if (!error) {
          await supabase.rpc('increment_vote', { p_post_id: postId })
          setCount(c => c + 1)
          setVoted(true)
        }
      }
    } finally {
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      aria-label={voted ? 'Remove vote' : 'Upvote this fuck-up'}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 rounded-lg border px-3 py-2 text-sm font-bold transition-all',
        voted
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-secondary text-muted-foreground hover:border-primary hover:text-primary',
        loading && 'opacity-50 cursor-not-allowed',
      )}
    >
      <ChevronUp className={cn('h-5 w-5 transition-transform', voted && '-translate-y-0.5')} />
      <span className="tabular-nums leading-none">{count.toLocaleString()}</span>
    </button>
  )
}
