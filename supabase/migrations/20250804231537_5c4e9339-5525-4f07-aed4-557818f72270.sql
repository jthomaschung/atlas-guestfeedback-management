-- Update the is_admin function to handle uppercase roles
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_hierarchy 
    WHERE user_hierarchy.user_id = $1 
    AND UPPER(role) = 'ADMIN'
  );
$function$