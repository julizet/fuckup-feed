'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeletePostButtonProps {
  postId: string
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', postId)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Delete this post?</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirming(false)}
          className="h-7 px-2 text-xs text-muted-foreground"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleDelete}
          disabled={loading}
          className="h-7 gap-1 px-2 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          Yes, delete
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setConfirming(true)}
      className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </Button>
  )
}
