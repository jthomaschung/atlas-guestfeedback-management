-- Fix the auto_escalate_critical_feedback function to handle system user
CREATE OR REPLACE FUNCTION public.auto_escalate_critical_feedback()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    NEW.approval_status := 'pending_approval';
    NEW.ready_for_dm_resolution := FALSE;
    
    -- Set SLA deadline (2 hours for critical issues)
    NEW.sla_deadline := now() + INTERVAL '2 hours';
    
    -- Log the escalation - only if user_id is not system user
    IF NEW.user_id != '00000000-0000-0000-0000-000000000000' THEN
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
    ELSE
      -- For system user, log without escalated_by
      INSERT INTO escalation_log (
        feedback_id,
        escalated_from,
        escalated_to,
        escalation_reason
      ) VALUES (
        NEW.id,
        COALESCE(CASE WHEN OLD IS NOT NULL THEN OLD.resolution_status ELSE NULL END, 'pending'),
        'escalated',
        'Auto-escalated: Critical issue detected - requires executive approval'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Now update the miscategorized Out Of Product feedback
UPDATE customer_feedback
SET 
  priority = 'Critical',
  updated_at = now()
WHERE LOWER(TRIM(complaint_category)) = 'out of product'
AND priority != 'Critical';