-- Fix database functions to use net.http_post (not pg_net.http_post)

-- Update notify_feedback_stakeholders function
CREATE OR REPLACE FUNCTION public.notify_feedback_stakeholders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  service_role_key TEXT;
  supabase_url TEXT;
BEGIN
  supabase_url := 'https://frmjdxziwwlfpgevszga.supabase.co';
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Use net.http_post (the schema created by pg_net extension)
  PERFORM net.http_post(
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
$function$;

-- Update check_feedback_alerts function
CREATE OR REPLACE FUNCTION public.check_feedback_alerts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  service_role_key TEXT;
  supabase_url TEXT;
  hours_since_created INTEGER;
BEGIN
  supabase_url := 'https://frmjdxziwwlfpgevszga.supabase.co';
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  hours_since_created := EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 3600;
  
  -- Check for SLA warning (24 hours)
  IF NEW.resolution_status NOT IN ('resolved', 'escalated') AND hours_since_created >= 24 THEN
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/send-feedback-slack-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'type', 'sla_warning',
        'feedbackId', NEW.id
      )
    );
  END IF;
  
  -- Check for critical escalation
  IF NEW.resolution_status = 'escalated' AND OLD.resolution_status != 'escalated' THEN
    PERFORM net.http_post(
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
  
  RETURN NEW;
END;
$function$;