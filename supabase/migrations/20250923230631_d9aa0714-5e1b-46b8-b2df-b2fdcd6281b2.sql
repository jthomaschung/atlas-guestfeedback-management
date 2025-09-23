-- Create storage bucket for feedback screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('feedback-screenshots', 'feedback-screenshots', false);

-- Create storage policies for feedback screenshots
CREATE POLICY "Users can upload their own feedback screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'feedback-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own feedback screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'feedback-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all feedback screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'feedback-screenshots' AND is_admin(auth.uid()));

-- Add screenshot_path column to internal_feedback table
ALTER TABLE public.internal_feedback 
ADD COLUMN screenshot_path TEXT,
ADD COLUMN page_context TEXT;