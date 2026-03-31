-- Drop the redundant trigger that duplicates critical escalation logic
-- auto_escalate_critical_feedback_before_trigger already handles this more comprehensively
DROP TRIGGER IF EXISTS trigger_auto_escalate_critical ON public.customer_feedback;
DROP FUNCTION IF EXISTS auto_escalate_critical_feedback();