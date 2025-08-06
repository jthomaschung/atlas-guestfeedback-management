-- Drop the problematic policy first
DROP POLICY IF EXISTS "Users can mark their own notifications as read" ON public.notification_log;

-- Create a security definer function to get current user email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create a simpler policy using the function
CREATE POLICY "Users can mark their own notifications as read" 
ON public.notification_log 
FOR UPDATE 
USING (recipient_email = public.get_current_user_email())
WITH CHECK (recipient_email = public.get_current_user_email());