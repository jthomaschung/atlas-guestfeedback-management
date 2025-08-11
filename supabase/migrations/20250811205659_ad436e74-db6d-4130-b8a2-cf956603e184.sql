-- Fix the security definer view issue by recreating the view without security definer
DROP VIEW IF EXISTS public.public_profiles;

-- Create a regular view (not security definer) for public profile information
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  display_name,
  created_at,
  updated_at
FROM public.profiles;

-- Enable RLS on the view  
ALTER VIEW public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the public profiles view
CREATE POLICY "Authenticated users can view public profile info" 
ON public.public_profiles 
FOR SELECT 
TO authenticated 
USING (true);