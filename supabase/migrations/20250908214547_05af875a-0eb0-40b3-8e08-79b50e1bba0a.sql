-- Fix security definer functions by setting proper search path
CREATE OR REPLACE FUNCTION public.check_sniper_badge(user_uuid uuid, period_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT NOT EXISTS (
    SELECT 1 
    FROM public.customer_feedback cf
    JOIN public.periods p ON cf.feedback_date >= p.start_date AND cf.feedback_date <= p.end_date
    WHERE cf.user_id = user_uuid 
    AND p.id = period_uuid
    AND cf.complaint_category IN ('Sandwich Made Wrong', 'Missing item')
  );
$$;

CREATE OR REPLACE FUNCTION public.check_speed_demon_badge(user_uuid uuid, period_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT NOT EXISTS (
    SELECT 1 
    FROM public.customer_feedback cf
    JOIN public.periods p ON cf.feedback_date >= p.start_date AND cf.feedback_date <= p.end_date
    WHERE cf.user_id = user_uuid 
    AND p.id = period_uuid
    AND cf.complaint_category = 'Slow service'
  );
$$;

CREATE OR REPLACE FUNCTION public.check_red_carpet_badge(user_uuid uuid, period_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (
    SELECT COUNT(*) 
    FROM public.customer_feedback cf
    JOIN public.periods p ON cf.feedback_date >= p.start_date AND cf.feedback_date <= p.end_date
    WHERE cf.user_id = user_uuid 
    AND p.id = period_uuid
    AND cf.complaint_category = 'Praise'
  ) > 3;
$$;