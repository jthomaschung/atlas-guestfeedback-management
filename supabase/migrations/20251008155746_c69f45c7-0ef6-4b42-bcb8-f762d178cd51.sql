-- Create daily summary log table
CREATE TABLE IF NOT EXISTS public.daily_summary_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_date DATE NOT NULL,
  recipient_email TEXT NOT NULL,
  summary_type TEXT NOT NULL CHECK (summary_type IN ('company', 'regional')),
  region TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_summary_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view summary logs
CREATE POLICY "Admins can view all summary logs"
ON public.daily_summary_log
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- System can insert logs
CREATE POLICY "System can insert summary logs"
ON public.daily_summary_log
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_daily_summary_log_date ON public.daily_summary_log(summary_date);
CREATE INDEX idx_daily_summary_log_recipient ON public.daily_summary_log(recipient_email);

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily summary at 6:00 AM
SELECT cron.schedule(
  'send-daily-feedback-summary',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://frmjdxziwwlfpgevszga.supabase.co/functions/v1/send-daily-summary',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZybWpkeHppd3dsZnBnZXZzemdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTQ1ODMsImV4cCI6MjA2ODE3MDU4M30.9EUl0YeXsNg2kpkcKjwWWgNKhucz41CZsGknXGq5XyM"}'::jsonb,
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);