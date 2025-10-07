-- Make is_executive function case-insensitive
CREATE OR REPLACE FUNCTION public.is_executive(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_hierarchy 
    WHERE user_id = user_uuid 
    AND UPPER(role) IN ('CEO', 'VP', 'DIRECTOR', 'ADMIN')
  );
$$;