-- Create trigger to automatically set SLA deadline when feedback is escalated
CREATE OR REPLACE FUNCTION public.set_sla_deadline_on_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Set SLA deadline to 48 hours from escalation time
  IF NEW.resolution_status = 'escalated' AND OLD.resolution_status != 'escalated' THEN
    NEW.sla_deadline := NEW.escalated_at + INTERVAL '48 hours';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_sla_on_escalation ON customer_feedback;

-- Create trigger on customer_feedback table
CREATE TRIGGER set_sla_on_escalation
  BEFORE UPDATE ON customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION set_sla_deadline_on_escalation();

-- Create SLA notification tracking table
CREATE TABLE IF NOT EXISTS public.sla_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL REFERENCES customer_feedback(id) ON DELETE CASCADE,
  notification_type text NOT NULL, -- '36_hour', '44_hour', 'violation'
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(feedback_id, notification_type)
);

-- Enable RLS on sla_notifications
ALTER TABLE public.sla_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for executives to view SLA notifications
CREATE POLICY "Executives can view SLA notifications"
ON sla_notifications
FOR SELECT
TO authenticated
USING (is_executive(auth.uid()));

-- Policy for system to insert SLA notifications
CREATE POLICY "System can insert SLA notifications"
ON sla_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);