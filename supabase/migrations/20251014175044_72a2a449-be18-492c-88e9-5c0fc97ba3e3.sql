-- Add Slack user ID to profiles table for direct message notifications
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS slack_user_id TEXT;