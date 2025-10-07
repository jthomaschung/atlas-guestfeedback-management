-- Update is_executive function (already exists with user_uuid parameter)
CREATE OR REPLACE FUNCTION public.is_executive(user_uuid uuid)
RETURNS boolean  
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_hierarchy 
    WHERE user_hierarchy.user_id = user_uuid
    AND role IN ('ceo', 'vp', 'director')
  );
$$;

-- Create is_dm function with user_id parameter (matching the existing one)
CREATE OR REPLACE FUNCTION public.is_dm(user_id uuid)
RETURNS boolean
LANGUAGE sql  
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_hierarchy 
    WHERE user_hierarchy.user_id = user_id
    AND role = 'dm'
  );
$$;