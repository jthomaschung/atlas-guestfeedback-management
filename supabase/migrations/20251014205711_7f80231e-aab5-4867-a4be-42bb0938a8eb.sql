-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_executive_hierarchy(text, text);

-- Recreate get_executive_hierarchy to use user_permissions.markets instead of user_market_permissions
CREATE OR REPLACE FUNCTION public.get_executive_hierarchy(p_market text, p_store_number text)
RETURNS TABLE(
  user_id uuid,
  email text,
  display_name text,
  role text,
  notification_level integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH 
  -- Get executives based on market permissions from user_permissions.markets array
  market_hierarchy AS (
    SELECT 
      uh.user_id,
      p.email,
      p.display_name,
      uh.role,
      CASE 
        WHEN UPPER(uh.role) = 'VP' THEN 1
        WHEN UPPER(uh.role) = 'DIRECTOR' THEN 2
        WHEN UPPER(uh.role) = 'DM' THEN 3
        ELSE 4
      END as notification_level
    FROM user_hierarchy uh
    JOIN profiles p ON uh.user_id = p.user_id
    LEFT JOIN user_permissions up ON uh.user_id = up.user_id
    WHERE UPPER(uh.role) IN ('VP', 'DIRECTOR', 'DM')
      AND (
        -- VP and Director need market access via user_permissions.markets array
        (UPPER(uh.role) IN ('VP', 'DIRECTOR') AND p_market = ANY(up.markets))
        -- DM gets included if they have the specific store
        OR (UPPER(uh.role) = 'DM' AND p_store_number = ANY(up.stores))
      )
  ),
  
  -- Get CEO (always included regardless of market)
  ceo_hierarchy AS (
    SELECT 
      uh.user_id,
      p.email,
      p.display_name,
      uh.role,
      0 as notification_level
    FROM user_hierarchy uh
    JOIN profiles p ON uh.user_id = p.user_id
    WHERE UPPER(uh.role) = 'CEO'
  ),
  
  -- Get District Manager from stores table (matching by display_name to manager column)
  dm_from_stores AS (
    SELECT 
      p.user_id,
      p.email,
      p.display_name,
      'DM'::text as role,
      3 as notification_level
    FROM stores s
    JOIN profiles p ON s.manager = p.display_name
    WHERE s.store_number = p_store_number
      AND s.manager IS NOT NULL
  )
  
  SELECT * FROM ceo_hierarchy
  UNION
  SELECT * FROM market_hierarchy
  UNION
  SELECT * FROM dm_from_stores
  ORDER BY notification_level;
$$;