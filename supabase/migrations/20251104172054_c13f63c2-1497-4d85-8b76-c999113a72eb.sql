-- Fix market name inconsistencies in user_permissions
-- Update all market names to use the format with spaces to match customer_feedback table

UPDATE user_permissions 
SET markets = ARRAY(
  SELECT DISTINCT 
    CASE 
      WHEN market = 'AZ1' THEN 'AZ 1'
      WHEN market = 'AZ2' THEN 'AZ 2'
      WHEN market = 'AZ3' THEN 'AZ 3'
      WHEN market = 'AZ4' THEN 'AZ 4'
      WHEN market = 'AZ5' THEN 'AZ 5'
      WHEN market = 'FL1' THEN 'FL 1'
      WHEN market = 'FL2' THEN 'FL 2'
      WHEN market = 'FL3' THEN 'FL 3'
      WHEN market = 'MN1' THEN 'MN 1'
      WHEN market = 'MN2' THEN 'MN 2'
      WHEN market = 'NE1' THEN 'NE 1'
      WHEN market = 'NE2' THEN 'NE 2'
      WHEN market = 'NE3' THEN 'NE 3'
      WHEN market = 'NE4' THEN 'NE 4'
      ELSE market
    END
  FROM unnest(markets) AS market
  ORDER BY 1
)
WHERE EXISTS (
  SELECT 1 FROM unnest(markets) AS m 
  WHERE m IN ('AZ1','AZ2','AZ3','AZ4','AZ5','FL1','FL2','FL3','MN1','MN2','NE1','NE2','NE3','NE4')
);