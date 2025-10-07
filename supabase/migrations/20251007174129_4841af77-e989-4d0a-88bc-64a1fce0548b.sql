-- Create function to sync user market permissions from user_permissions.markets array
CREATE OR REPLACE FUNCTION public.sync_user_market_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete existing market permissions for this user
  DELETE FROM user_market_permissions WHERE user_id = NEW.user_id;
  
  -- Insert new market permissions based on markets array
  -- Match against both market name and display_name to handle variations
  INSERT INTO user_market_permissions (user_id, market_id)
  SELECT DISTINCT
    NEW.user_id,
    m.id
  FROM unnest(NEW.markets) AS market_name
  JOIN markets m ON (
    m.name = market_name OR 
    m.display_name = market_name OR
    REPLACE(m.name, ' ', '') = market_name OR
    REPLACE(m.display_name, ' ', '') = market_name
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync market permissions when user_permissions is updated
DROP TRIGGER IF EXISTS sync_markets_trigger ON user_permissions;
CREATE TRIGGER sync_markets_trigger
  AFTER INSERT OR UPDATE OF markets ON user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_market_permissions();

-- Sync all existing user market permissions
DELETE FROM user_market_permissions;

INSERT INTO user_market_permissions (user_id, market_id)
SELECT DISTINCT
  up.user_id,
  m.id
FROM user_permissions up
CROSS JOIN unnest(up.markets) AS market_name
JOIN markets m ON (
  m.name = market_name OR 
  m.display_name = market_name OR
  REPLACE(m.name, ' ', '') = market_name OR
  REPLACE(m.display_name, ' ', '') = market_name
)
WHERE up.markets IS NOT NULL;