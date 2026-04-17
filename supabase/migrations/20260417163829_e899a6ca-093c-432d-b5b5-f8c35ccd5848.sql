-- 1. Create the routing function
CREATE OR REPLACE FUNCTION public.route_customer_feedback_assignee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category TEXT;
  v_store_email TEXT;
  v_store_profile_exists BOOLEAN;
  v_routed_assignee TEXT;
BEGIN
  v_category := LOWER(COALESCE(NEW.complaint_category, ''));

  -- Critical / auto-escalate categories
  IF v_category IN ('food poisoning', 'credit card issue', 'credit card', 'food safety') THEN
    v_routed_assignee := 'guestfeedback@atlaswe.com'; -- escalation handled separately, keep GFM visible
  -- Store-level follow-up categories
  ELSIF v_category IN (
    'order accuracy',
    'missing item',
    'sandwich made wrong',
    'sandwich wrong',
    'sandwich issue',
    'bread quality',
    'product quality',
    'cleanliness',
    'slow service',
    'rude staff',
    'closed early',
    'out of product - bread',
    'out of product - other',
    'out of product'
  ) THEN
    v_store_email := 'store' || NEW.store_number || '@atlaswe.com';
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE email = v_store_email)
      INTO v_store_profile_exists;
    IF v_store_profile_exists THEN
      v_routed_assignee := v_store_email;
    ELSE
      v_routed_assignee := 'guestfeedback@atlaswe.com';
    END IF;
  ELSE
    v_routed_assignee := 'guestfeedback@atlaswe.com';
  END IF;

  -- Only override when our routing has a more specific destination than the inbound payload.
  -- If the inbound assignee already matches our routed value, keep it.
  -- If our routing finds a store/escalation target, always use it.
  IF v_routed_assignee IS NOT NULL
     AND v_routed_assignee <> 'guestfeedback@atlaswe.com' THEN
    NEW.assignee := v_routed_assignee;
  ELSIF NEW.assignee IS NULL OR NEW.assignee = '' THEN
    NEW.assignee := v_routed_assignee;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Attach trigger (BEFORE INSERT so it runs for every insertion path)
DROP TRIGGER IF EXISTS trg_route_customer_feedback_assignee ON public.customer_feedback;
CREATE TRIGGER trg_route_customer_feedback_assignee
BEFORE INSERT ON public.customer_feedback
FOR EACH ROW
EXECUTE FUNCTION public.route_customer_feedback_assignee();

-- 3. Backfill existing mis-routed open records
UPDATE public.customer_feedback cf
SET assignee = 'store' || cf.store_number || '@atlaswe.com',
    updated_at = now()
WHERE cf.assignee = 'guestfeedback@atlaswe.com'
  AND COALESCE(cf.resolution_status, 'unopened') IN ('unopened', 'opened')
  AND LOWER(cf.complaint_category) IN (
    'order accuracy',
    'missing item',
    'sandwich made wrong',
    'sandwich wrong',
    'sandwich issue',
    'bread quality',
    'product quality',
    'cleanliness',
    'slow service',
    'rude staff',
    'closed early',
    'out of product - bread',
    'out of product - other',
    'out of product'
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.email = 'store' || cf.store_number || '@atlaswe.com'
  );