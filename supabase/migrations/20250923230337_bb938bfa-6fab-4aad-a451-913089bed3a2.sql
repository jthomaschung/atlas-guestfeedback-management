-- Create internal feedback table for bug reports, feedback, and wishlist items
CREATE TABLE public.internal_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Bug', 'Feedback', 'Wishlist')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT,
  browser_info JSONB,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.internal_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own feedback"
ON public.internal_feedback
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback"
ON public.internal_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
ON public.internal_feedback
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update feedback"
ON public.internal_feedback
FOR UPDATE
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_internal_feedback_updated_at
BEFORE UPDATE ON public.internal_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();