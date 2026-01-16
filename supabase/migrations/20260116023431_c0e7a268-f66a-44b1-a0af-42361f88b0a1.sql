-- Create praise_comments table
CREATE TABLE public.praise_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.customer_feedback(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.praise_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all comments
CREATE POLICY "Users can read praise comments"
  ON public.praise_comments FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert their own comments
CREATE POLICY "Users can insert their own comments"
  ON public.praise_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON public.praise_comments FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.praise_comments FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Indexes for faster queries
CREATE INDEX idx_praise_comments_feedback_id ON public.praise_comments(feedback_id);
CREATE INDEX idx_praise_comments_created_at ON public.praise_comments(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_praise_comments_updated_at
  BEFORE UPDATE ON public.praise_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();