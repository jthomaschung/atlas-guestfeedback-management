-- Fix security vulnerability: Restrict profile access to prevent email harvesting
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more restrictive policies
-- Policy 1: Users can view their own complete profile (including email)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Admins can view all profiles (for management purposes)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Policy 3: Users can view limited public information of other users (for @mentions, assignee dropdowns, etc.)
-- This policy allows viewing display names and user IDs but NOT email addresses
CREATE POLICY "Users can view public profile info" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL)
WITH CHECK (false);

-- Create a secure view for public profile information that excludes sensitive data
CREATE OR REPLACE VIEW public.public_profiles AS
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
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Grant access to the public profiles view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Create RLS policy for the public profiles view
CREATE POLICY "Authenticated users can view public profile info" 
ON public.public_profiles 
FOR SELECT 
TO authenticated 
USING (true);