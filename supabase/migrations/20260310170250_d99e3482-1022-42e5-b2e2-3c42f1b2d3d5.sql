ALTER TABLE public.customer_feedback 
  ADD COLUMN IF NOT EXISTS type_of_feedback text,
  ADD COLUMN IF NOT EXISTS reward text,
  ADD COLUMN IF NOT EXISTS feedback_source text;