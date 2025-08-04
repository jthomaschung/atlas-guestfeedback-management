-- Update profiles RLS policy to allow viewing all profiles (needed for hierarchy management)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Create a function to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_hierarchy 
    WHERE user_hierarchy.user_id = $1 
    AND role = 'admin'
  );
$$;