-- Add RLS policy to allow users to mark their own notifications as read
CREATE POLICY "Users can mark their own notifications as read" 
ON public.notification_log 
FOR UPDATE 
USING (recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
WITH CHECK (recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid()));