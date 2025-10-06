-- Drop the existing trigger that runs BEFORE INSERT
DROP TRIGGER IF EXISTS auto_escalate_critical_feedback_trigger ON customer_feedback;

-- Recreate the trigger function to work with AFTER INSERT
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
  IF is_critical AND NEW.resolution_status != 'escalated' THEN
    -- Update the feedback record to escalated status
    UPDATE customer_feedback
    SET 
      resolution_status = 'escalated',
      escalated_at = now(),
      auto_escalated = true,
      approval_status = 'pending_approval',
      ready_for_dm_resolution = FALSE,
      sla_deadline = now() + INTERVAL '2 hours'
    WHERE id = NEW.id;
    
    -- Now insert into escalation log (feedback record exists now)
    IF NEW.user_id != '00000000-0000-0000-0000-000000000000' THEN
      INSERT INTO escalation_log (
        feedback_id,
        escalated_from,
        escalated_to,
        escalation_reason,
        escalated_by
      ) VALUES (
        NEW.id,
        'pending',
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
        'pending',
        'escalated',
        'Auto-escalated: Critical issue detected - requires executive approval'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger to run AFTER INSERT instead of BEFORE
CREATE TRIGGER auto_escalate_critical_feedback_trigger
AFTER INSERT ON customer_feedback
FOR EACH ROW
EXECUTE FUNCTION public.auto_escalate_critical_feedback();