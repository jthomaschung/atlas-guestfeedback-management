-- Update the INSERT policy for notification_preferences to allow admins
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.notification_preferences;

CREATE POLICY "Users can insert their own preferences" 
ON public.notification_preferences 
FOR INSERT 
WITH CHECK ((auth.uid() = user_id) OR is_admin(auth.uid()));