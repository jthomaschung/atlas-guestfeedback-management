
CREATE OR REPLACE FUNCTION public.route_customer_feedback_assignee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_raw_lower TEXT;
  v_normalized TEXT;
  v_cat_lower TEXT;
  v_store_email TEXT;
  v_store_profile_exists BOOLEAN;
  v_routed_assignee TEXT;
  v_dm_email TEXT;
  v_cleaned TEXT;
BEGIN
  -- 1. Normalize complaint_category (mirror edge function categoryNormalization)
  v_raw_lower := LOWER(TRIM(COALESCE(NEW.complaint_category, '')));
  v_normalized := CASE v_raw_lower
    WHEN 'sandwich issue' THEN 'Sandwich Made Wrong'
    WHEN 'order issue' THEN 'Sandwich Made Wrong'
    WHEN 'sandwich made wrong' THEN 'Sandwich Made Wrong'
    WHEN 'submitted incorrect order' THEN 'Sandwich Made Wrong'
    WHEN 'order accuracy' THEN 'Order Accuracy'
    WHEN 'missing items' THEN 'Missing Item'
    WHEN 'missing item' THEN 'Missing Item'
    WHEN 'delivery timing' THEN 'Slow Service'
    WHEN 'delivery complaint' THEN 'Slow Service'
    WHEN 'slow service' THEN 'Slow Service'
    WHEN 'team member friendliness' THEN 'Rude Service'
    WHEN 'team member complaint' THEN 'Rude Service'
    WHEN 'rude' THEN 'Rude Service'
    WHEN 'rude service' THEN 'Rude Service'
    WHEN 'rude staff' THEN 'Rude Service'
    WHEN 'hours' THEN 'Closed Early'
    WHEN 'closed early' THEN 'Closed Early'
    WHEN 'oop' THEN 'Out of Product'
    WHEN 'out of stock' THEN 'Out of Product'
    WHEN 'out of stock item' THEN 'Out of Product'
    WHEN 'out of product' THEN 'Out of Product'
    WHEN 'product not available' THEN 'Out of Product'
    WHEN 'foreign object' THEN 'Possible Food Poisoning'
    WHEN 'health safety' THEN 'Possible Food Poisoning'
    WHEN 'illness' THEN 'Possible Food Poisoning'
    WHEN 'allergic reaction guest' THEN 'Possible Food Poisoning'
    WHEN 'food poisoning' THEN 'Possible Food Poisoning'
    WHEN 'food safety' THEN 'Possible Food Poisoning'
    WHEN 'gift card issue' THEN 'Credit Card Issue'
    WHEN 'incorrect change' THEN 'Credit Card Issue'
    WHEN 'pricing issue' THEN 'Credit Card Issue'
    WHEN 'unauthorized tip' THEN 'Credit Card Issue'
    WHEN 'credit card' THEN 'Credit Card Issue'
    WHEN 'credit card issue' THEN 'Credit Card Issue'
    WHEN 'product quality' THEN 'Product Issue'
    WHEN 'product issue' THEN 'Product Issue'
    WHEN 'taste' THEN 'Product Issue'
    WHEN 'bread quality' THEN 'Bread Quality'
    WHEN 'cleanliness' THEN 'Cleanliness'
    WHEN 'praise' THEN 'Praise'
    WHEN 'loyalty program issues' THEN 'Loyalty Program Issues'
    WHEN 'portion' THEN 'Other'
    WHEN 'appearance' THEN 'Other'
    WHEN 'area of restaurant' THEN 'Other'
    WHEN 'online ordering' THEN 'Other'
    WHEN 'online ordering issues' THEN 'Other'
    WHEN 'duplicate order' THEN 'Other'
    WHEN 'employment and hiring' THEN 'Other'
    WHEN 'compensation/benefits team member' THEN 'Other'
    WHEN 'menu question' THEN 'Other'
    WHEN 'no feedback provided' THEN 'Other'
    WHEN 'not honored' THEN 'Other'
    WHEN 'order not received' THEN 'Other'
    WHEN 'wrong store' THEN 'Other'
    WHEN 'gloves/equipment' THEN 'Other'
    WHEN 'handicap access' THEN 'Other'
    ELSE NEW.complaint_category
  END;

  IF v_normalized IS NOT NULL AND v_normalized <> '' THEN
    NEW.complaint_category := v_normalized;
  END IF;

  -- 2. Strip "Category : ... Sub Category : ... Description : " prefix from feedback_text
  IF NEW.feedback_text IS NOT NULL AND NEW.feedback_text ~* '^\s*Category\s*:' THEN
    -- Try to extract everything after "Description :"
    v_cleaned := regexp_replace(NEW.feedback_text, '^.*?Description\s*:\s*', '', 'is');
    IF v_cleaned IS NOT NULL AND v_cleaned <> '' AND v_cleaned <> NEW.feedback_text THEN
      NEW.feedback_text := TRIM(v_cleaned);
    END IF;
  END IF;

  -- 3. Routing tiers
  v_cat_lower := LOWER(COALESCE(NEW.complaint_category, ''));

  IF v_cat_lower IN (
    'sandwich made wrong',
    'missing item',
    'order accuracy',
    'cleanliness',
    'praise',
    'bread quality',
    'product quality'
  ) THEN
    -- Store-level
    v_store_email := 'store' || NEW.store_number || '@atlaswe.com';
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE email = v_store_email)
      INTO v_store_profile_exists;
    IF v_store_profile_exists THEN
      v_routed_assignee := v_store_email;
    ELSE
      v_routed_assignee := 'guestfeedback@atlaswe.com';
    END IF;

  ELSIF v_cat_lower IN (
    'closed early',
    'rude service',
    'out of product',
    'possible food poisoning'
  ) THEN
    -- DM-level: lookup by market
    SELECT p.email INTO v_dm_email
    FROM public.user_hierarchy uh
    JOIN public.profiles p ON p.user_id = uh.user_id
    JOIN public.user_market_permissions ump ON ump.user_id = uh.user_id
    JOIN public.markets m ON m.id = ump.market_id
    WHERE uh.role = 'DM'
      AND REPLACE(UPPER(m.name), ' ', '') = REPLACE(UPPER(COALESCE(NEW.market, '')), ' ', '')
    LIMIT 1;

    IF v_dm_email IS NOT NULL THEN
      v_routed_assignee := v_dm_email;
    ELSE
      v_routed_assignee := 'guestfeedback@atlaswe.com';
    END IF;

  ELSE
    -- Guest Feedback (Slow Service, Product Issue, Credit Card Issue, Loyalty, Other, etc.)
    v_routed_assignee := 'guestfeedback@atlaswe.com';
  END IF;

  -- Always trust our routing (overrides webhook payload)
  NEW.assignee := v_routed_assignee;

  RETURN NEW;
END;
$function$;

-- Ensure trigger exists for INSERT and UPDATE of complaint_category
DROP TRIGGER IF EXISTS trg_route_customer_feedback_assignee ON public.customer_feedback;
CREATE TRIGGER trg_route_customer_feedback_assignee
  BEFORE INSERT OR UPDATE OF complaint_category, store_number, market
  ON public.customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.route_customer_feedback_assignee();
