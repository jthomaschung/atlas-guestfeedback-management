-- Update is_admin function to include Directors
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
    AND UPPER(role) IN ('ADMIN', 'CEO', 'VP', 'DIRECTOR')
  );
$function$;