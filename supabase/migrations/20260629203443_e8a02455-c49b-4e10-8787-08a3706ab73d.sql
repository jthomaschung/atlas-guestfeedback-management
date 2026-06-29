
-- Make FYI never suppress critical-category escalation.
-- Critical categories (Rude Service, Out of Product, Possible Food Poisoning)
-- always escalate to the DM, regardless of type_of_feedback = 'FYI'.

CREATE OR REPLACE FUNCTION public.fn_resolve_feedback_routing(
  _category text, _type_of_feedback text, _store_number text, _market text, _feedback_text text
)
RETURNS TABLE(priority text, assignee text, should_escalate boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cat_lower text := lower(COALESCE(_category, ''));
  type_lower text := lower(trim(COALESCE(_type_of_feedback, '')));
  text_lower text := lower(COALESCE(_feedback_text, ''));
  store_followup_cats text[] := ARRAY[
    'order issue','order accuracy','sandwich made wrong','missing item',
    'missing items','sandwich issue','cleanliness','closed early'
  ];
  auto_escalate_cats text[] := ARRAY[
    'out of product','rude service','possible food poisoning','rude','oop'
  ];
  _priority text;
  _assignee text;
  _escalate boolean := false;
  is_critical_cat boolean := false;
BEGIN
  _priority := CASE cat_lower
    WHEN 'sandwich made wrong' THEN 'High'
    WHEN 'slow service' THEN 'Medium'
    WHEN 'rude service' THEN 'Critical'
    WHEN 'product issue' THEN 'Low'
    WHEN 'closed early' THEN 'High'
    WHEN 'praise' THEN 'High'
    WHEN 'rockstar service' THEN 'High'
    WHEN 'missing item' THEN 'High'
    WHEN 'credit card issue' THEN 'Low'
    WHEN 'bread quality' THEN 'Medium'
    WHEN 'out of product' THEN 'Critical'
    WHEN 'other' THEN 'Low'
    WHEN 'cleanliness' THEN 'Medium'
    WHEN 'possible food poisoning' THEN 'Critical'
    WHEN 'loyalty program issues' THEN 'Low'
    WHEN 'unauthorized tip' THEN 'Low'
    WHEN 'order accuracy' THEN 'High'
    ELSE 'Low'
  END;

  IF text_lower LIKE '%food poisoning%' THEN
    _priority := 'Critical';
  END IF;

  is_critical_cat := cat_lower = ANY(auto_escalate_cats) OR text_lower LIKE '%food poisoning%';

  -- Critical categories override FYI routing — always go to DM
  IF is_critical_cat THEN
    _assignee := public.fn_find_dm_for_market(_market);
    IF _assignee IS NULL OR _assignee = '' THEN
      _assignee := 'guestfeedback@atlaswe.com';
    END IF;
  ELSIF type_lower = 'fyi' THEN
    IF cat_lower = ANY(store_followup_cats) THEN
      _assignee := public.fn_find_store_assignee(_store_number);
    ELSE
      _assignee := 'guestfeedback@atlaswe.com';
    END IF;
  ELSIF type_lower = 'guest support' THEN
    IF cat_lower = ANY(store_followup_cats) THEN
      _assignee := public.fn_find_store_assignee(_store_number);
    ELSE
      _assignee := 'guestfeedback@atlaswe.com';
    END IF;
  ELSIF type_lower IS NULL OR type_lower = '' THEN
    IF cat_lower IN ('sandwich made wrong','praise','missing item','cleanliness','order accuracy') THEN
      _assignee := public.fn_find_store_assignee(_store_number);
    ELSIF cat_lower = 'closed early' THEN
      _assignee := public.fn_find_dm_for_market(_market);
    ELSE
      _assignee := 'guestfeedback@atlaswe.com';
    END IF;
  ELSE
    _assignee := 'guestfeedback@atlaswe.com';
  END IF;

  -- Escalate whenever priority is Critical OR category is in critical list,
  -- regardless of FYI tag.
  _escalate := (_priority = 'Critical') OR is_critical_cat;

  RETURN QUERY SELECT _priority, _assignee, _escalate;
END;
$function$;

-- Backfill: re-route any open critical-category records that slipped through
UPDATE public.customer_feedback cf
SET complaint_category = complaint_category  -- no-op write to fire trg_recompute via category change? won't fire
WHERE FALSE;

-- Real backfill: directly fix records
WITH targets AS (
  SELECT cf.id, r.priority AS new_priority, r.assignee AS new_assignee, r.should_escalate
  FROM public.customer_feedback cf,
  LATERAL public.fn_resolve_feedback_routing(
    cf.complaint_category, cf.type_of_feedback, cf.store_number, cf.market, cf.feedback_text
  ) r
  WHERE cf.resolution_status NOT IN ('resolved','closed','archived')
    AND (
      lower(COALESCE(cf.complaint_category,'')) IN ('rude service','out of product','possible food poisoning')
      OR lower(COALESCE(cf.feedback_text,'')) LIKE '%food poisoning%'
    )
    AND (cf.priority <> 'Critical' OR cf.resolution_status <> 'escalated')
)
UPDATE public.customer_feedback cf
SET priority = t.new_priority,
    assignee = COALESCE(t.new_assignee, cf.assignee),
    resolution_status = CASE WHEN t.should_escalate THEN 'escalated' ELSE cf.resolution_status END,
    escalated_at = COALESCE(cf.escalated_at, CASE WHEN t.should_escalate THEN now() END),
    auto_escalated = CASE WHEN t.should_escalate THEN true ELSE cf.auto_escalated END,
    sla_deadline = COALESCE(cf.sla_deadline, CASE WHEN t.should_escalate THEN now() + interval '24 hours' END),
    updated_at = now()
FROM targets t
WHERE cf.id = t.id;
