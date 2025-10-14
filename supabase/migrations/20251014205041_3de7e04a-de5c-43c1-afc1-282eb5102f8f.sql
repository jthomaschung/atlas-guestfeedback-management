-- Update get_executive_hierarchy function to include DM from stores table

DROP FUNCTION IF EXISTS public.get_executive_hierarchy(text, text);

CREATE OR REPLACE FUNCTION public.get_executive_hierarchy(feedback_market text, feedback_store text)
RETURNS TABLE(user_id uuid, email text, display_name text, role text, notification_level integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH market_hierarchy AS (
    -- Get users with access to the specific market/store from user_hierarchy
    SELECT DISTINCT 
      p.user_id,
      p.email,
      p.display_name,
      uh.role,
      CASE 
        WHEN uh.role = 'ceo' THEN 1
        WHEN uh.role = 'vp' THEN 2  
        WHEN uh.role = 'director' THEN 3
        WHEN uh.role = 'dm' THEN 4
        WHEN uh.role = 'admin' THEN 5
        ELSE 6
      END as notification_level
    FROM profiles p
    JOIN user_hierarchy uh ON p.user_id = uh.user_id
    LEFT JOIN user_permissions up ON p.user_id = up.user_id
    WHERE uh.role IN ('admin', 'director', 'vp', 'ceo', 'dm')
    AND (
      -- CEO and VP have access to everything
      uh.role IN ('ceo', 'vp') OR
      -- Admin access (all)
      uh.role = 'admin' OR
      -- Market access
      user_has_market_access(p.user_id, feedback_market) OR
      -- Store access
      (feedback_store = ANY(up.stores))
    )
    
    UNION
    
    -- Get the District Manager from the stores table manager column
    SELECT DISTINCT
      p.user_id,
      p.email,
      p.display_name,
      'dm' as role,
      4 as notification_level
    FROM stores s
    JOIN profiles p ON LOWER(TRIM(p.display_name)) = LOWER(TRIM(s.manager))
    WHERE s.store_number = feedback_store
    AND s.manager IS NOT NULL
    AND TRIM(s.manager) != ''
  )
  SELECT 
    mh.user_id,
    mh.email,
    mh.display_name,
    mh.role,
    mh.notification_level
  FROM market_hierarchy mh
  ORDER BY mh.notification_level ASC;
$$;