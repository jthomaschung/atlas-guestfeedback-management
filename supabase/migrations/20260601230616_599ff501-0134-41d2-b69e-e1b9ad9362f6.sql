-- Escalate on UPDATE when category becomes critical (e.g. category changed via dropdown post-ingest)
CREATE OR REPLACE FUNCTION public.auto_escalate_critical_feedback_on_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_category TEXT := regexp_replace(lower(trim(COALESCE(NEW.complaint_category, ''))), '[_-]+', ' ', 'g');
  is_critical_cat BOOLEAN := normalized_category IN ('rude service', 'out of product', 'out of stock', 'possible food poisoning');
BEGIN
  IF is_critical_cat THEN
    -- Set priority to Critical if not already
    IF NEW.priority IS DISTINCT FROM 'Critical' THEN
      NEW.priority := 'Critical';
    END IF;

    -- Only escalate if currently in an active (non-terminal) workflow state
    IF COALESCE(NEW.resolution_status, '') NOT IN ('escalated', 'resolved', 'acknowledged') THEN
      NEW.resolution_status := 'escalated';
      NEW.escalated_at := COALESCE(NEW.escalated_at, now());
      NEW.auto_escalated := COALESCE(NEW.auto_escalated, true);
      NEW.approval_status := COALESCE(NEW.approval_status, 'pending_approval');
      NEW.ready_for_dm_resolution := FALSE;
      NEW.sla_deadline := COALESCE(NEW.sla_deadline, now() + INTERVAL '2 hours');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_escalate_critical_feedback_update_trigger ON public.customer_feedback;
CREATE TRIGGER auto_escalate_critical_feedback_update_trigger
  BEFORE UPDATE OF complaint_category ON public.customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_escalate_critical_feedback_on_update();

-- Backfill: escalate any existing critical-category records still stuck in active states
UPDATE public.customer_feedback
SET
  priority = 'Critical',
  resolution_status = 'escalated',
  escalated_at = COALESCE(escalated_at, now()),
  auto_escalated = true,
  approval_status = COALESCE(approval_status, 'pending_approval'),
  ready_for_dm_resolution = FALSE,
  sla_deadline = COALESCE(sla_deadline, now() + INTERVAL '2 hours')
WHERE lower(complaint_category) IN ('rude service', 'out of product', 'out of stock', 'possible food poisoning')
  AND resolution_status NOT IN ('escalated', 'resolved', 'acknowledged');