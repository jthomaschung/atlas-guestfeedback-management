-- Create trigger to auto-escalate Critical priority feedback
CREATE OR REPLACE FUNCTION auto_escalate_critical_feedback()
RETURNS TRIGGER AS $$
BEGIN
  -- If priority is being set to Critical and status is not already escalated
  IF NEW.priority = 'Critical' AND NEW.resolution_status != 'escalated' THEN
    NEW.resolution_status := 'escalated';
    NEW.escalated_at := COALESCE(NEW.escalated_at, NOW());
    NEW.sla_deadline := COALESCE(NEW.sla_deadline, NOW() + INTERVAL '48 hours');
    NEW.auto_escalated := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_auto_escalate_critical ON customer_feedback;
CREATE TRIGGER trigger_auto_escalate_critical
  BEFORE INSERT OR UPDATE OF priority
  ON customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION auto_escalate_critical_feedback();