-- FuckUp Feed: Full Database Schema

-- ============================================================
-- POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  location TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  hashtags TEXT[] DEFAULT '{}',
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read posts
CREATE POLICY "posts_select_all" ON public.posts FOR SELECT USING (true);

-- Logged in users can insert their own posts
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- VOTES TABLE (anonymous by session fingerprint OR user id)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- for anonymous voters
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- each user or session can only vote once per post
  UNIQUE(post_id, user_id),
  UNIQUE(post_id, session_id)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read votes (for counts)
CREATE POLICY "votes_select_all" ON public.votes FOR SELECT USING (true);

-- Allow insert: either user-based or anonymous
CREATE POLICY "votes_insert_any" ON public.votes FOR INSERT WITH CHECK (true);

-- Users can delete their own votes
CREATE POLICY "votes_delete_own" ON public.votes FOR DELETE USING (
  auth.uid() = user_id OR session_id IS NOT NULL
);

-- ============================================================
-- FUNCTION: increment vote count on post
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_vote(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts SET vote_count = vote_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_vote(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts SET vote_count = GREATEST(0, vote_count - 1) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS posts_vote_count_idx ON public.posts(vote_count DESC);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_category_idx ON public.posts(category);
CREATE INDEX IF NOT EXISTS votes_post_id_idx ON public.votes(post_id);
