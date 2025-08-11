-- Fix security vulnerability: Restrict notification log access to prevent email exposure
-- Remove the overly permissive policy that allows viewing all notification logs
DROP POLICY IF EXISTS "Users can view notification logs" ON public.notification_log;

-- Create a secure policy that only allows users to view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notification_log 
FOR SELECT 
USING (recipient_email = get_current_user_email());

-- The existing policies for service role and users marking their own notifications as read are already secure and remain unchanged