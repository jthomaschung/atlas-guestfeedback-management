CREATE OR REPLACE FUNCTION public.auto_escalate_critical_feedback_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_category TEXT := regexp_replace(lower(trim(COALESCE(NEW.complaint_category, ''))), '[_-]+', ' ', 'g');
  normalized_market TEXT := upper(regexp_replace(trim(COALESCE(NEW.market, '')), '\s+', '', 'g'));
  mapped_priority TEXT;
  dm_email TEXT;
  store_email TEXT;
  is_critical BOOLEAN := false;
BEGIN
  -- 1) Category -> priority mapping
  mapped_priority := CASE
    WHEN normalized_category = 'sandwich made wrong' THEN 'High'
    WHEN normalized_category = 'slow service' THEN 'Medium'
    WHEN normalized_category = 'rude service' THEN 'Critical'
    WHEN normalized_category = 'product issue' THEN 'Low'
    WHEN normalized_category = 'closed early' THEN 'High'
    WHEN normalized_category = 'praise' THEN 'High'
    WHEN normalized_category = 'missing item' THEN 'High'
    WHEN normalized_category = 'order accuracy' THEN 'High'
    WHEN normalized_category = 'credit card issue' THEN 'Low'
    WHEN normalized_category = 'bread quality' THEN 'Medium'
    WHEN normalized_category IN ('out of product', 'out of stock') THEN 'Critical'
    WHEN normalized_category = 'other' THEN 'Low'
    WHEN normalized_category = 'cleanliness' THEN 'Medium'
    WHEN normalized_category = 'possible food poisoning' THEN 'Critical'
    WHEN normalized_category IN ('loyalty program issue', 'loyalty program issues') THEN 'Low'
    WHEN normalized_category = 'unauthorized tip' THEN 'Low'
    ELSE NULL
  END;

  IF mapped_priority IS NOT NULL THEN
    NEW.priority := mapped_priority;
  ELSE
    NEW.priority := COALESCE(NULLIF(trim(COALESCE(NEW.priority, '')), ''), 'Low');
  END IF;

  -- 2) Auto-assignment fallback for manual entries
  IF NEW.assignee IS NULL OR trim(NEW.assignee) = '' OR lower(trim(NEW.assignee)) = 'unassigned' THEN
    -- DM-level routing
    IF normalized_category IN ('rude service', 'out of product', 'out of stock', 'possible food poisoning') THEN
      SELECT p.email
      INTO dm_email
      FROM public.user_hierarchy uh
      JOIN public.user_market_permissions ump ON ump.user_id = uh.user_id
      JOIN public.profiles p ON p.user_id = uh.user_id
      WHERE uh.role IN ('DM', 'District Manager')
        AND EXISTS (
          SELECT 1
          FROM unnest(COALESCE(ump.markets, ARRAY[]::TEXT[])) AS market_entry
          WHERE upper(regexp_replace(market_entry, '\s+', '', 'g')) = normalized_market
        )
      ORDER BY p.email
      LIMIT 1;

      NEW.assignee := COALESCE(dm_email, 'guestfeedback@atlaswe.com');

    -- Store-level routing
    ELSIF normalized_category IN ('sandwich made wrong', 'praise', 'missing item', 'cleanliness', 'order accuracy', 'closed early') THEN
      store_email := 'store' || trim(COALESCE(NEW.store_number, '')) || '@atlaswe.com';
      NEW.assignee := store_email;

    -- Guest feedback manager-level routing
    ELSE
      NEW.assignee := 'guestfeedback@atlaswe.com';
    END IF;
  END IF;

  -- 3) Critical escalation defaults
  is_critical := (
    NEW.priority = 'Critical'
    OR normalized_category IN ('rude service', 'out of product', 'out of stock', 'possible food poisoning')
  );

  IF is_critical THEN
    NEW.resolution_status := 'escalated';
    NEW.escalated_at := COALESCE(NEW.escalated_at, now());
    NEW.auto_escalated := true;
    NEW.approval_status := 'pending_approval';
    NEW.ready_for_dm_resolution := FALSE;
    NEW.sla_deadline := COALESCE(NEW.sla_deadline, now() + INTERVAL '2 hours');
  END IF;

  RETURN NEW;
END;
$$;