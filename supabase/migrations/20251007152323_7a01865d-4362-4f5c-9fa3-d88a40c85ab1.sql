-- Update the trigger function to auto-archive when all 3 roles have approved
CREATE OR REPLACE FUNCTION public.update_feedback_approval_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  approvals_count INTEGER;
  ceo_approved BOOLEAN;
  vp_approved BOOLEAN;
  director_approved BOOLEAN;
BEGIN
  -- Count distinct role approvals for this feedback
  SELECT
    EXISTS(SELECT 1 FROM critical_feedback_approvals WHERE feedback_id = NEW.feedback_id AND LOWER(approver_role) = 'ceo') INTO ceo_approved;
  
  SELECT
    EXISTS(SELECT 1 FROM critical_feedback_approvals WHERE feedback_id = NEW.feedback_id AND LOWER(approver_role) = 'vp') INTO vp_approved;
  
  SELECT
    EXISTS(SELECT 1 FROM critical_feedback_approvals WHERE feedback_id = NEW.feedback_id AND LOWER(approver_role) = 'director') INTO director_approved;

  -- Update the specific approval timestamps based on role
  UPDATE customer_feedback
  SET 
    ceo_approved_at = CASE WHEN LOWER(NEW.approver_role) = 'ceo' THEN NEW.approved_at ELSE ceo_approved_at END,
    vp_approved_at = CASE WHEN LOWER(NEW.approver_role) = 'vp' THEN NEW.approved_at ELSE vp_approved_at END,
    director_approved_at = CASE WHEN LOWER(NEW.approver_role) = 'director' THEN NEW.approved_at ELSE director_approved_at END,
    ready_for_dm_resolution = (ceo_approved AND vp_approved AND director_approved),
    approval_status = CASE 
      WHEN (ceo_approved AND vp_approved AND director_approved) THEN 'fully_approved'
      ELSE 'pending_approval'
    END,
    resolution_status = CASE
      WHEN (ceo_approved AND vp_approved AND director_approved) THEN 'resolved'
      ELSE resolution_status
    END,
    updated_at = now()
  WHERE id = NEW.feedback_id;
  
  RETURN NEW;
END;
$function$;