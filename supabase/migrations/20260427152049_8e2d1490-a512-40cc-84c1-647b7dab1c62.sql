CREATE OR REPLACE FUNCTION public.get_executive_hierarchy(p_market text, p_store_number text)
 RETURNS TABLE(user_id uuid, email text, display_name text, role text, notification_level integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH
  -- VPs and Directors with access to this market via user_market_permissions -> markets
  market_hierarchy AS (
    SELECT DISTINCT
      uh.user_id,
      p.email,
      p.display_name,
      uh.role,
      CASE
        WHEN UPPER(uh.role) = 'VP' THEN 1
        WHEN UPPER(uh.role) = 'DIRECTOR' THEN 2
        ELSE 4
      END AS notification_level
    FROM user_hierarchy uh
    JOIN profiles p ON uh.user_id = p.user_id
    JOIN user_market_permissions ump ON ump.user_id = uh.user_id
    JOIN markets m ON m.id = ump.market_id
    WHERE UPPER(uh.role) IN ('VP', 'DIRECTOR')
      AND m.name = p_market
  ),

  -- CEO is always notified
  ceo_hierarchy AS (
    SELECT
      uh.user_id,
      p.email,
      p.display_name,
      uh.role,
      0 AS notification_level
    FROM user_hierarchy uh
    JOIN profiles p ON uh.user_id = p.user_id
    WHERE UPPER(uh.role) = 'CEO'
  ),

  -- DM looked up from stores.manager -> profiles.display_name
  dm_from_stores AS (
    SELECT
      p.user_id,
      p.email,
      p.display_name,
      'DM'::text AS role,
      3 AS notification_level
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
$function$;