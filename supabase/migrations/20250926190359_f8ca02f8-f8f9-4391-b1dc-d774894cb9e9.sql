-- Update user roles for proper hierarchy
UPDATE user_hierarchy 
SET role = 'ceo' 
WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'jchung@atlaswe.com');

UPDATE user_hierarchy 
SET role = 'vp' 
WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'atambunan@atlaswe.com');

-- Update the is_admin function to include CEO, VP, and Admin roles
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
    AND UPPER(role) IN ('ADMIN', 'CEO', 'VP')
  );
$function$;

-- Create critical feedback approvals table
CREATE TABLE public.critical_feedback_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.customer_feedback(id) ON DELETE CASCADE,
  approver_user_id UUID NOT NULL,
  approver_role TEXT NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executive_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on critical feedback approvals
ALTER TABLE public.critical_feedback_approvals ENABLE ROW LEVEL SECURITY;

-- Add approval status fields to customer_feedback
ALTER TABLE public.customer_feedback 
ADD COLUMN approval_status TEXT DEFAULT 'pending_approval',
ADD COLUMN ceo_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN vp_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN director_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN ready_for_dm_resolution BOOLEAN DEFAULT FALSE;

-- Create function to get required approvers for critical feedback
CREATE OR REPLACE FUNCTION public.get_required_approvers_for_feedback(feedback_market text, feedback_store text)
RETURNS TABLE(user_id uuid, email text, display_name text, role text, approval_order integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  )
  SELECT 
    ah.user_id,
    ah.email,
    ah.display_name,
    ah.role,
    ah.approval_order
  FROM approver_hierarchy ah
  ORDER BY ah.approval_order ASC;
$function$;

-- Create function to check if all required approvals are collected
CREATE OR REPLACE FUNCTION public.check_critical_feedback_approvals(feedback_id_param uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Count received approvals
  SELECT COUNT(*)
  INTO received_approvals_count
  FROM critical_feedback_approvals
  WHERE feedback_id = feedback_id_param;
  
  -- Return true if all required approvals are received
  RETURN received_approvals_count >= required_approvers_count;
END;
$function$;

-- Create RLS policies for critical feedback approvals
CREATE POLICY "Executives can view critical feedback approvals"
ON public.critical_feedback_approvals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM user_hierarchy 
    WHERE user_hierarchy.user_id = auth.uid() 
    AND user_hierarchy.role IN ('admin', 'ceo', 'vp', 'director')
  )
);

CREATE POLICY "Executives can insert their own approvals"
ON public.critical_feedback_approvals
FOR INSERT
WITH CHECK (
  auth.uid() = approver_user_id AND
  EXISTS (
    SELECT 1 
    FROM user_hierarchy 
    WHERE user_hierarchy.user_id = auth.uid() 
    AND user_hierarchy.role IN ('admin', 'ceo', 'vp', 'director')
  )
);

-- Create trigger to update approval status when approvals are added
CREATE OR REPLACE FUNCTION public.update_feedback_approval_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update the specific approval timestamps based on role
  UPDATE customer_feedback
  SET 
    ceo_approved_at = CASE WHEN NEW.approver_role = 'ceo' THEN NEW.approved_at ELSE ceo_approved_at END,
    vp_approved_at = CASE WHEN NEW.approver_role = 'vp' THEN NEW.approved_at ELSE vp_approved_at END,
    director_approved_at = CASE WHEN NEW.approver_role = 'director' THEN NEW.approved_at ELSE director_approved_at END,
    ready_for_dm_resolution = check_critical_feedback_approvals(NEW.feedback_id),
    approval_status = CASE 
      WHEN check_critical_feedback_approvals(NEW.feedback_id) THEN 'ready_for_resolution'
      ELSE 'pending_approval'
    END
  WHERE id = NEW.feedback_id;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER update_approval_status_trigger
AFTER INSERT ON public.critical_feedback_approvals
FOR EACH ROW
EXECUTE FUNCTION public.update_feedback_approval_status();

-- Update auto escalation trigger to set initial approval status for critical feedback
CREATE OR REPLACE FUNCTION public.auto_escalate_critical_feedback()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_critical BOOLEAN := false;
  escalation_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Determine if feedback is critical
  is_critical := (
    NEW.priority = 'Critical' OR 
    NEW.complaint_category = 'Out of Product' OR 
    NEW.complaint_category = 'Rude Service'
  );
  
  -- If it's critical and not already escalated
  IF is_critical AND NEW.resolution_status != 'escalated' AND (OLD IS NULL OR OLD.resolution_status != 'escalated') THEN
    -- Auto-escalate to escalated status
    NEW.resolution_status := 'escalated';
    NEW.escalated_at := now();
    NEW.auto_escalated := true;
    NEW.approval_status := 'pending_approval';
    NEW.ready_for_dm_resolution := FALSE;
    
    -- Set SLA deadline (2 hours for critical issues)
    NEW.sla_deadline := now() + INTERVAL '2 hours';
    
    -- Log the escalation
    INSERT INTO escalation_log (
      feedback_id,
      escalated_from,
      escalated_to,
      escalation_reason,
      escalated_by
    ) VALUES (
      NEW.id,
      COALESCE(CASE WHEN OLD IS NOT NULL THEN OLD.resolution_status ELSE NULL END, 'pending'),
      'escalated',
      'Auto-escalated: Critical issue detected - requires executive approval',
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;