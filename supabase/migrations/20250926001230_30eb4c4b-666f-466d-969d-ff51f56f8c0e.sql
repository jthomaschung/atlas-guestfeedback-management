-- Create function to get executive hierarchy for notifications with proper security
CREATE OR REPLACE FUNCTION public.get_executive_hierarchy(feedback_market text, feedback_store text)
RETURNS TABLE(
  user_id uuid,
  email text,
  display_name text,
  role text,
  notification_level integer
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH market_hierarchy AS (
    -- Get users with access to the specific market/store
    SELECT DISTINCT 
      p.user_id,
      p.email,
      p.display_name,
      uh.role,
      CASE 
        WHEN uh.role = 'ceo' THEN 1
        WHEN uh.role = 'vp' THEN 2  
        WHEN uh.role = 'director' THEN 3
        WHEN uh.role = 'admin' THEN 4
        ELSE 5
      END as notification_level
    FROM profiles p
    JOIN user_hierarchy uh ON p.user_id = uh.user_id
    LEFT JOIN user_permissions up ON p.user_id = up.user_id
    WHERE uh.role IN ('admin', 'director', 'vp', 'ceo')
    AND (
      -- Admin access (all)
      uh.role = 'admin' OR
      -- Market access
      user_has_market_access(p.user_id, feedback_market) OR
      -- Store access
      (feedback_store = ANY(up.stores))
    )
  )
  SELECT 
    mh.user_id,
    mh.email,
    mh.display_name,
    mh.role,
    mh.notification_level
  FROM market_hierarchy mh
  ORDER BY mh.notification_level ASC;
$$;

-- Create function to auto-escalate critical feedback with proper security
CREATE OR REPLACE FUNCTION public.auto_escalate_critical_feedback()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      'Auto-escalated: Critical issue detected',
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-escalation
DROP TRIGGER IF EXISTS trigger_auto_escalate_critical ON public.customer_feedback;
CREATE TRIGGER trigger_auto_escalate_critical
  BEFORE INSERT OR UPDATE ON public.customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_escalate_critical_feedback();

-- Create function to check for SLA violations with proper security
CREATE OR REPLACE FUNCTION public.check_sla_violations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  violation_record RECORD;
BEGIN
  -- Find critical issues that have exceeded SLA
  FOR violation_record IN
    SELECT cf.id, cf.case_number, cf.market, cf.store_number, cf.sla_deadline
    FROM customer_feedback cf
    WHERE cf.resolution_status = 'escalated'
    AND cf.sla_deadline < now()
    AND cf.resolved_at IS NULL
  LOOP
    -- Log SLA violation
    INSERT INTO escalation_log (
      feedback_id,
      escalated_from,
      escalated_to,
      escalation_reason
    ) VALUES (
      violation_record.id,
      'escalated',
      'sla_violation',
      'SLA deadline exceeded: ' || violation_record.sla_deadline
    );
  END LOOP;
END;
$$;