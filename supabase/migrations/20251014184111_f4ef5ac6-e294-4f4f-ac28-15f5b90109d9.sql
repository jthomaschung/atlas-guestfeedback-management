-- Drop and recreate the get_executive_hierarchy function to include all executives
-- regardless of market/store permissions (they have company-wide access)

DROP FUNCTION IF EXISTS public.get_executive_hierarchy(text, text);

CREATE OR REPLACE FUNCTION public.get_executive_hierarchy(feedback_market text, feedback_store text)
RETURNS TABLE(user_id uuid, email text, display_name text, role text, notification_level integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH market_hierarchy AS (
    -- Get users with access to the specific market/store
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