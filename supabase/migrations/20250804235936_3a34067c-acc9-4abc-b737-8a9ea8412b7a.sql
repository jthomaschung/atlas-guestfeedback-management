-- Fix notification preferences RLS policy to allow users to create their own preferences
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.notification_preferences;

CREATE POLICY "Users can insert their own preferences" 
ON public.notification_preferences 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add email column to profiles table if not exists (to connect display names with emails)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;