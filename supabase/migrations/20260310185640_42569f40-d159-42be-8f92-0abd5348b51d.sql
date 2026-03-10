
CREATE TABLE public.feedback_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL REFERENCES public.customer_feedback(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (feedback_id, user_id)
);

ALTER TABLE public.feedback_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view likes"
  ON public.feedback_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like feedback"
  ON public.feedback_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike feedback"
  ON public.feedback_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_feedback_likes_feedback_id ON public.feedback_likes(feedback_id);
CREATE INDEX idx_feedback_likes_user_id ON public.feedback_likes(user_id);
