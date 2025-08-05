-- Check current RLS policy for profiles UPDATE
-- Update the UPDATE policy for profiles to allow admins
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING ((auth.uid() = user_id) OR is_admin(auth.uid()));