-- Drop the functions with CASCADE to remove dependencies, then recreate everything

DROP FUNCTION IF EXISTS public.is_executive(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_dm(uuid) CASCADE;

-- Recreate the helper functions
CREATE FUNCTION public.is_executive(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_hierarchy 
    WHERE user_hierarchy.user_id = user_uuid 
    AND UPPER(role) IN ('CEO', 'VP', 'DIRECTOR', 'ADMIN')
  );
$$;

CREATE FUNCTION public.is_dm(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_hierarchy 
    WHERE user_hierarchy.user_id = user_uuid 
    AND UPPER(role) = 'DM'
  );
$$;

-- Recreate the RLS policy for critical_feedback_approvals
DROP POLICY IF EXISTS "Executives and DMs can insert their own approvals" ON public.critical_feedback_approvals;

CREATE POLICY "Executives and DMs can insert their own approvals"
ON public.critical_feedback_approvals
FOR INSERT
WITH CHECK (
  auth.uid() = approver_user_id 
  AND (is_executive(auth.uid()) OR is_dm(auth.uid()))
);

-- Recreate the SELECT policy for critical_feedback_approvals
DROP POLICY IF EXISTS "Users can view their own or all if executive" ON public.critical_feedback_approvals;

CREATE POLICY "Users can view their own or all if executive"
ON public.critical_feedback_approvals
FOR SELECT
USING (
  is_executive(auth.uid()) 
  OR (approver_user_id = auth.uid() AND is_dm(auth.uid()))
);

-- Recreate affected customer_feedback policy
DROP POLICY IF EXISTS "Users can view feedback for their accessible stores" ON public.customer_feedback;

CREATE POLICY "Users can view feedback for their accessible stores"
ON public.customer_feedback
FOR SELECT
USING (
  is_admin(auth.uid()) 
  OR user_has_market_access_v2(auth.uid(), market) 
  OR user_has_store_access(auth.uid(), store_number) 
  OR (resolution_status = 'escalated' AND is_executive(auth.uid()))
);