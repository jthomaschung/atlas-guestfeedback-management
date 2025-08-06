-- Add read status to notification_log table
ALTER TABLE public.notification_log 
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for better performance when querying unread notifications
CREATE INDEX idx_notification_log_read_status ON public.notification_log (recipient_email, read_at, sent_at);