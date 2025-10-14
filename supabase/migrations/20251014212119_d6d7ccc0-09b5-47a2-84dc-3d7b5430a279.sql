-- Enable pg_net extension for async HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to notify stakeholders when new feedback is created
CREATE OR REPLACE FUNCTION notify_feedback_stakeholders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  service_role_key TEXT;
  supabase_url TEXT;
BEGIN
  -- Get environment variables (these would be set by Supabase)
  supabase_url := 'https://frmjdxziwwlfpgevszga.supabase.co';
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Call edge function asynchronously for new feedback notification
  PERFORM extensions.http_post(
    url := supabase_url || '/functions/v1/send-feedback-slack-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'type', 'new_feedback',
      'feedbackId', NEW.id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger on INSERT to customer_feedback table
DROP TRIGGER IF EXISTS on_feedback_created ON customer_feedback;
CREATE TRIGGER on_feedback_created
  AFTER INSERT ON customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION notify_feedback_stakeholders();

-- Function to check for critical escalation and SLA violations
CREATE OR REPLACE FUNCTION check_feedback_alerts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  service_role_key TEXT;
  supabase_url TEXT;
  hours_until_deadline NUMERIC;
  critical_count_today INTEGER;
BEGIN
  supabase_url := 'https://frmjdxziwwlfpgevszga.supabase.co';
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Check for critical escalation (auto_escalated = true)
  IF NEW.auto_escalated = true AND (OLD.auto_escalated IS NULL OR OLD.auto_escalated = false) THEN
    PERFORM extensions.http_post(
      url := supabase_url || '/functions/v1/send-feedback-slack-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'type', 'critical_escalation',
        'feedbackId', NEW.id
      )
    );
  END IF;
  
  -- Check for SLA warnings (12 hours before deadline)
  IF NEW.sla_deadline IS NOT NULL AND NEW.resolution_status != 'resolved' THEN
    hours_until_deadline := EXTRACT(EPOCH FROM (NEW.sla_deadline - NOW())) / 3600;
    
    -- SLA exceeded
    IF hours_until_deadline <= 0 AND (OLD.sla_deadline IS NULL OR EXTRACT(EPOCH FROM (OLD.sla_deadline - NOW())) / 3600 > 0) THEN
      PERFORM extensions.http_post(
        url := supabase_url || '/functions/v1/send-feedback-slack-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'type', 'sla_exceeded',
          'feedbackId', NEW.id
        )
      );
    -- SLA warning (12 hours before)
    ELSIF hours_until_deadline > 0 AND hours_until_deadline <= 12 AND 
          (OLD.sla_deadline IS NULL OR EXTRACT(EPOCH FROM (OLD.sla_deadline - NOW())) / 3600 > 12) THEN
      PERFORM extensions.http_post(
        url := supabase_url || '/functions/v1/send-feedback-slack-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'type', 'sla_warning',
          'feedbackId', NEW.id,
          'hoursRemaining', hours_until_deadline
        )
      );
    END IF;
  END IF;
  
  -- Check for store alert (3+ critical in a day)
  IF NEW.priority = 'Critical' THEN
    SELECT COUNT(*) INTO critical_count_today
    FROM customer_feedback
    WHERE store_number = NEW.store_number
      AND priority = 'Critical'
      AND feedback_date >= CURRENT_DATE;
    
    -- Send alert if this is the 3rd critical feedback today
    IF critical_count_today = 3 THEN
      PERFORM extensions.http_post(
        url := supabase_url || '/functions/v1/send-feedback-slack-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'type', 'store_alert',
          'feedbackId', NEW.id
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger on UPDATE to customer_feedback table
DROP TRIGGER IF EXISTS on_feedback_updated ON customer_feedback;
CREATE TRIGGER on_feedback_updated
  AFTER UPDATE ON customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION check_feedback_alerts();

-- Function to notify when customer responds
CREATE OR REPLACE FUNCTION notify_customer_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  service_role_key TEXT;
  supabase_url TEXT;
  feedback_record RECORD;
BEGIN
  -- Only trigger for inbound messages
  IF NEW.direction != 'inbound' THEN
    RETURN NEW;
  END IF;
  
  supabase_url := 'https://frmjdxziwwlfpgevszga.supabase.co';
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Get the feedback record to update customer_responded_at
  SELECT * INTO feedback_record
  FROM customer_feedback
  WHERE id = NEW.feedback_id;
  
  -- Update feedback record
  UPDATE customer_feedback
  SET customer_responded_at = NEW.sent_at,
      customer_response_sentiment = NEW.response_sentiment
  WHERE id = NEW.feedback_id;
  
  -- Send notification
  PERFORM extensions.http_post(
    url := supabase_url || '/functions/v1/send-feedback-slack-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'type', 'customer_response',
      'feedbackId', NEW.feedback_id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger on INSERT to customer_outreach_log for inbound messages
DROP TRIGGER IF EXISTS on_customer_response_received ON customer_outreach_log;
CREATE TRIGGER on_customer_response_received
  AFTER INSERT ON customer_outreach_log
  FOR EACH ROW
  WHEN (NEW.direction = 'inbound')
  EXECUTE FUNCTION notify_customer_response();

-- Create a cron job to run weekly performance summary (runs every Monday at 8 AM)
-- Note: This requires pg_cron extension and needs to be run separately in production
-- SELECT cron.schedule(
--   'send-weekly-performance-summary',
--   '0 8 * * 1', -- Every Monday at 8 AM
--   $$
--   SELECT extensions.http_post(
--     url := 'https://frmjdxziwwlfpgevszga.supabase.co/functions/v1/send-weekly-performance-summary',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--     body := '{}'::jsonb
--   );
--   $$
-- );