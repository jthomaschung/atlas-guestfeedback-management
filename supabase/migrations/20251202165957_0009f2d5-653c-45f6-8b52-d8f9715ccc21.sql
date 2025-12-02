-- Add feedback_id column to notification_log for guest feedback notifications
ALTER TABLE public.notification_log 
ADD COLUMN IF NOT EXISTS feedback_id uuid REFERENCES public.customer_feedback(id) ON DELETE CASCADE;

-- Add message column for notification content
ALTER TABLE public.notification_log 
ADD COLUMN IF NOT EXISTS message text;

-- Add tagger_name column to show who tagged the user
ALTER TABLE public.notification_log 
ADD COLUMN IF NOT EXISTS tagger_name text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_log_feedback_id ON public.notification_log(feedback_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_recipient_read ON public.notification_log(recipient_email, read_at) WHERE read_at IS NULL;