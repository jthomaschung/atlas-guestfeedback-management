CREATE OR REPLACE FUNCTION public.notify_customer_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  service_role_key text;
  supabase_url text := 'https://frmjdxziwwlfpgevszga.supabase.co';
BEGIN
  IF NEW.direction IS DISTINCT FROM 'inbound' THEN
    RETURN NEW;
  END IF;

  UPDATE public.customer_feedback
  SET customer_responded_at = COALESCE(NEW.sent_at, now()),
      customer_response_sentiment = NEW.response_sentiment,
      updated_at = now()
  WHERE id = NEW.feedback_id;

  -- Best-effort notification only. Never block saving the customer reply.
  BEGIN
    service_role_key := current_setting('app.settings.service_role_key', true);

    IF service_role_key IS NOT NULL AND length(service_role_key) > 0 THEN
      PERFORM net.http_post(
        url := supabase_url || '/functions/v1/send-feedback-slack-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'type', 'customer_response',
          'feedbackId', NEW.feedback_id
        ),
        timeout_milliseconds := 5000
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Customer response notification failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$function$;