-- Enable service role to insert into notification_log
CREATE POLICY "Service role can insert notification logs" 
ON public.notification_log 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Enable service role to update notification_log
CREATE POLICY "Service role can update notification logs" 
ON public.notification_log 
FOR UPDATE 
TO service_role
USING (true);