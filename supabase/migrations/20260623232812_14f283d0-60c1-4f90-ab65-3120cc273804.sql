
-- =====================================================================
-- Helper: find store assignee email (store{number}@atlaswe.com if exists)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.fn_find_store_assignee(_store_number text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT email FROM public.profiles
       WHERE email = 'store' || _store_number || '@atlaswe.com'
       LIMIT 1),
    'Unassigned'
  );
$$;

-- =====================================================================
-- Helper: find DM email for a market
-- =====================================================================
CREATE OR REPLACE FUNCTION public.fn_find_dm_for_market(_market text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _market_id uuid;
  _dm_email text;
  _norm text;
BEGIN
  IF _market IS NULL OR _market = '' THEN RETURN 'Unassigned'; END IF;
  _norm := upper(regexp_replace(_market, '\s+', '', 'g'));

  SELECT id INTO _market_id FROM public.markets
   WHERE name = _market
      OR upper(regexp_replace(name, '\s+', '', 'g')) = _norm
   LIMIT 1;

  IF _market_id IS NULL THEN RETURN 'Unassigned'; END IF;

  SELECT p.email INTO _dm_email
    FROM public.user_market_permissions ump
    JOIN public.user_hierarchy uh ON uh.user_id = ump.user_id AND uh.role = 'DM'
    JOIN public.profiles p ON p.user_id = ump.user_id
   WHERE ump.market_id = _market_id
   LIMIT 1;

  RETURN COALESCE(_dm_email, 'Unassigned');
END;
$$;

-- =====================================================================
-- Core: resolve routing for a feedback row
-- Returns: priority, assignee, should_escalate
-- Mirrors logic in supabase/functions/ingest-feedback/index.ts
-- =====================================================================
CREATE OR REPLACE FUNCTION public.fn_resolve_feedback_routing(
  _category text,
  _type_of_feedback text,
  _store_number text,
  _market text,
  _feedback_text text
)
RETURNS TABLE(priority text, assignee text, should_escalate boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
BEGIN
  -- Priority mapping (mirrors edge function)
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

  -- Food poisoning keyword override
  IF text_lower LIKE '%food poisoning%' THEN
    _priority := 'Critical';
  END IF;

  -- Routing
  IF type_lower = 'fyi' THEN
    IF cat_lower = ANY(store_followup_cats) THEN
      _assignee := public.fn_find_store_assignee(_store_number);
    ELSE
      _assignee := 'guestfeedback@atlaswe.com';
    END IF;
  ELSIF type_lower = 'guest support' THEN
    IF cat_lower = ANY(store_followup_cats) THEN
      _assignee := public.fn_find_store_assignee(_store_number);
    ELSIF cat_lower = ANY(auto_escalate_cats) THEN
      _assignee := public.fn_find_dm_for_market(_market);
    ELSE
      _assignee := 'guestfeedback@atlaswe.com';
    END IF;
  ELSIF type_lower IS NULL OR type_lower = '' THEN
    -- Legacy category-based routing
    IF cat_lower IN ('sandwich made wrong','praise','missing item','cleanliness','order accuracy') THEN
      _assignee := public.fn_find_store_assignee(_store_number);
    ELSIF cat_lower = ANY(auto_escalate_cats) OR cat_lower = 'closed early' THEN
      _assignee := public.fn_find_dm_for_market(_market);
    ELSE
      _assignee := 'guestfeedback@atlaswe.com';
    END IF;
    IF text_lower LIKE '%food poisoning%' THEN
      _assignee := public.fn_find_dm_for_market(_market);
    END IF;
  ELSE
    _assignee := 'guestfeedback@atlaswe.com';
  END IF;

  -- Should escalate?
  _escalate := (_priority = 'Critical')
            OR (type_lower = 'guest support' AND cat_lower = ANY(auto_escalate_cats));

  RETURN QUERY SELECT _priority, _assignee, _escalate;
END;
$$;

-- =====================================================================
-- Trigger: re-resolve routing when category or type changes
-- Never downgrades priority; preserves manual upgrades.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.trg_recompute_feedback_routing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  priority_rank text[] := ARRAY['Low','Medium','High','Critical'];
  cur_rank int;
  new_rank int;
BEGIN
  -- Only react to category/type changes
  IF (NEW.complaint_category IS NOT DISTINCT FROM OLD.complaint_category)
     AND (NEW.type_of_feedback IS NOT DISTINCT FROM OLD.type_of_feedback) THEN
    RETURN NEW;
  END IF;

  -- Skip resolved/closed records
  IF NEW.resolution_status IN ('resolved','closed','archived') THEN
    RETURN NEW;
  END IF;

  SELECT * INTO r FROM public.fn_resolve_feedback_routing(
    NEW.complaint_category,
    NEW.type_of_feedback,
    NEW.store_number,
    NEW.market,
    NEW.feedback_text
  );

  -- Priority: only escalate upward
  cur_rank := COALESCE(array_position(priority_rank, NEW.priority), 0);
  new_rank := COALESCE(array_position(priority_rank, r.priority), 0);
  IF new_rank > cur_rank THEN
    NEW.priority := r.priority;
  END IF;

  -- Assignee: always re-route to rule-derived assignee (unless rule returns Unassigned)
  IF r.assignee IS NOT NULL AND r.assignee NOT IN ('Unassigned','') THEN
    NEW.assignee := r.assignee;
  END IF;

  -- Escalation side effects
  IF r.should_escalate AND NEW.resolution_status <> 'escalated' THEN
    NEW.resolution_status := 'escalated';
    NEW.escalated_at := COALESCE(NEW.escalated_at, now());
    NEW.auto_escalated := true;
    NEW.sla_deadline := COALESCE(NEW.sla_deadline, now() + interval '24 hours');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recompute_feedback_routing ON public.customer_feedback;
CREATE TRIGGER trg_recompute_feedback_routing
BEFORE UPDATE ON public.customer_feedback
FOR EACH ROW
EXECUTE FUNCTION public.trg_recompute_feedback_routing();

-- =====================================================================
-- One-time backfill: re-resolve routing for open/escalated rows where
-- the rule-derived priority is HIGHER than current priority. We bump
-- priority + re-route assignee + apply escalation flags.
-- =====================================================================
WITH ranked AS (
  SELECT
    cf.id,
    cf.priority AS cur_priority,
    cf.assignee AS cur_assignee,
    cf.resolution_status,
    r.priority AS new_priority,
    r.assignee AS new_assignee,
    r.should_escalate,
    array_position(ARRAY['Low','Medium','High','Critical']::text[], cf.priority) AS cur_rank,
    array_position(ARRAY['Low','Medium','High','Critical']::text[], r.priority) AS new_rank
  FROM public.customer_feedback cf
  CROSS JOIN LATERAL public.fn_resolve_feedback_routing(
    cf.complaint_category, cf.type_of_feedback, cf.store_number, cf.market, cf.feedback_text
  ) r
  WHERE cf.resolution_status IN ('opened','unopened','escalated')
)
UPDATE public.customer_feedback cf
   SET priority = ranked.new_priority,
       assignee = CASE WHEN ranked.new_assignee NOT IN ('Unassigned','')
                       THEN ranked.new_assignee ELSE cf.assignee END,
       resolution_status = CASE WHEN ranked.should_escalate AND cf.resolution_status <> 'escalated'
                                THEN 'escalated' ELSE cf.resolution_status END,
       escalated_at = CASE WHEN ranked.should_escalate AND cf.escalated_at IS NULL
                           THEN now() ELSE cf.escalated_at END,
       auto_escalated = CASE WHEN ranked.should_escalate
                             THEN true ELSE cf.auto_escalated END,
       sla_deadline = CASE WHEN ranked.should_escalate AND cf.sla_deadline IS NULL
                           THEN now() + interval '24 hours' ELSE cf.sla_deadline END
  FROM ranked
 WHERE cf.id = ranked.id
   AND COALESCE(ranked.new_rank,0) > COALESCE(ranked.cur_rank,0);
