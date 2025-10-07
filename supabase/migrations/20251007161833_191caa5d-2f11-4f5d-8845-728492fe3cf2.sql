-- Add dm_approved_at column to customer_feedback
ALTER TABLE public.customer_feedback
ADD COLUMN IF NOT EXISTS dm_approved_at timestamp with time zone;

-- Update the get_required_approvers_for_feedback function to include DMs
CREATE OR REPLACE FUNCTION public.get_required_approvers_for_feedback(feedback_market text, feedback_store text)
RETURNS TABLE(user_id uuid, email text, display_name text, role text, approval_order integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH approver_hierarchy AS (
    -- Get CEO (always required)
    SELECT 
      p.user_id,
      p.email,
      p.display_name,
      uh.role,
      1 as approval_order
    FROM profiles p
    JOIN user_hierarchy uh ON p.user_id = uh.user_id
    WHERE uh.role = 'ceo'
    
    UNION ALL
    
    -- Get VP (always required)
    SELECT 
      p.user_id,
      p.email,
      p.display_name,
      uh.role,
      2 as approval_order
    FROM profiles p
    JOIN user_hierarchy uh ON p.user_id = uh.user_id
    WHERE uh.role = 'vp'
    
    UNION ALL
    
    -- Get Market Director (based on market access)
    SELECT 
      p.user_id,
      p.email,
      p.display_name,
      uh.role,
      3 as approval_order
    FROM profiles p
    JOIN user_hierarchy uh ON p.user_id = uh.user_id
    LEFT JOIN user_permissions up ON p.user_id = up.user_id
    WHERE uh.role = 'director'
    AND (
      user_has_market_access(p.user_id, feedback_market) OR
      (feedback_store = ANY(up.stores))
    )
    
    UNION ALL
    
    -- Get DM (District Manager - based on market/store access)
    SELECT 
      p.user_id,
      p.email,
      p.display_name,
      uh.role,
      4 as approval_order
    FROM profiles p
    JOIN user_hierarchy uh ON p.user_id = uh.user_id
    LEFT JOIN user_permissions up ON p.user_id = up.user_id
    WHERE uh.role = 'dm'
    AND (
      user_has_market_access(p.user_id, feedback_market) OR
      (feedback_store = ANY(up.stores))
    )
  )
  SELECT 
    ah.user_id,
    ah.email,
    ah.display_name,
    ah.role,
    ah.approval_order
  FROM approver_hierarchy ah
  ORDER BY ah.approval_order ASC;
$$;

-- Update check_critical_feedback_approvals to include DM
CREATE OR REPLACE FUNCTION public.check_critical_feedback_approvals(feedback_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  required_approvers_count INTEGER;
  received_approvals_count INTEGER;
BEGIN
  -- Get feedback details
  SELECT COUNT(*)
  INTO required_approvers_count
  FROM get_required_approvers_for_feedback(
    (SELECT market FROM customer_feedback WHERE id = feedback_id_param),
    (SELECT store_number FROM customer_feedback WHERE id = feedback_id_param)
  );
  
  -- Count received approvals (should be 4: CEO, VP, Director, DM)
  SELECT COUNT(*)
  INTO received_approvals_count
  FROM critical_feedback_approvals
  WHERE feedback_id = feedback_id_param;
  
  -- Return true if all required approvals are received
  RETURN received_approvals_count >= required_approvers_count;
END;
$$;

-- Create helper function to check if user is DM
CREATE OR REPLACE FUNCTION public.is_dm(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_hierarchy 
    WHERE user_hierarchy.user_id = $1 
    AND UPPER(role) = 'DM'
  );
$$;

-- Update RLS policy to allow DMs to insert approvals
DROP POLICY IF EXISTS "Executives can insert their own approvals" ON critical_feedback_approvals;
CREATE POLICY "Executives and DMs can insert their own approvals"
ON critical_feedback_approvals
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = approver_user_id 
  AND (is_executive(auth.uid()) OR is_dm(auth.uid()))
);