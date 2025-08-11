-- Clean up the failed view attempt
DROP VIEW IF EXISTS public.public_profiles;

-- The RLS policies we created earlier are sufficient for security
-- Users can only see their own full profile or admins can see all
-- For @mentions functionality, we'll update the application code to handle the restricted access

-- Add a function to get public user information for legitimate use cases like @mentions
CREATE OR REPLACE FUNCTION public.get_user_display_info()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  first_name text,
  last_name text
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    user_id,
    display_name,
    first_name,
    last_name
  FROM public.profiles
  WHERE user_id IS NOT NULL;
$$;