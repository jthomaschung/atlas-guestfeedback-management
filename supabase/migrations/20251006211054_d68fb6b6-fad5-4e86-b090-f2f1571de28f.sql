-- Drop ALL existing escalation-related triggers and functions
DROP TRIGGER IF EXISTS auto_escalate_critical_feedback_trigger ON customer_feedback;
DROP TRIGGER IF EXISTS trigger_auto_escalate_critical ON customer_feedback;
DROP TRIGGER IF EXISTS auto_escalate_critical_feedback_before_trigger ON customer_feedback;
DROP TRIGGER IF EXISTS log_critical_feedback_escalation_trigger ON customer_feedback;

DROP FUNCTION IF EXISTS public.auto_escalate_critical_feedback();
DROP FUNCTION IF EXISTS public.auto_escalate_critical_feedback_before_insert();
DROP FUNCTION IF EXISTS public.log_critical_feedback_escalation();

-- Create BEFORE INSERT trigger function to set escalation fields
CREATE OR REPLACE FUNCTION public.auto_escalate_critical_feedback_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_critical BOOLEAN := false;
BEGIN
  -- Determine if feedback is critical
  is_critical := (
    NEW.priority = 'Critical' OR 
    NEW.complaint_category = 'Out of Product' OR 
    NEW.complaint_category = 'Rude Service'
  );
  
  -- If it's critical, set escalation fields before insert
  IF is_critical THEN
    NEW.resolution_status := 'escalated';
    NEW.escalated_at := now();
    NEW.auto_escalated := true;
    NEW.approval_status := 'pending_approval';
    NEW.ready_for_dm_resolution := FALSE;
    NEW.sla_deadline := now() + INTERVAL '2 hours';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create BEFORE INSERT trigger
CREATE TRIGGER auto_escalate_critical_feedback_before_trigger
BEFORE INSERT ON customer_feedback
FOR EACH ROW
EXECUTE FUNCTION public.auto_escalate_critical_feedback_before_insert();

-- Create AFTER INSERT trigger function to log escalations
CREATE OR REPLACE FUNCTION public.log_critical_feedback_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only log if the feedback is escalated
  IF NEW.resolution_status = 'escalated' AND NEW.auto_escalated = true THEN
    -- Insert into escalation log
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

-- Create AFTER INSERT trigger for logging
CREATE TRIGGER log_critical_feedback_escalation_trigger
AFTER INSERT ON customer_feedback
FOR EACH ROW
EXECUTE FUNCTION public.log_critical_feedback_escalation();