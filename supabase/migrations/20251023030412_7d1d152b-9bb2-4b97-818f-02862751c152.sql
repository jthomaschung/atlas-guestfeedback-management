
-- Update CEO and VP to have access to all markets
UPDATE user_permissions
SET markets = ARRAY['AZ 1', 'AZ 2', 'AZ 3', 'AZ 4', 'AZ 5', 'FL 1', 'FL 2', 'FL 3', 'IE/LA', 'MN 1', 'MN 2', 'NE 1', 'NE 2', 'NE 3', 'NE 4', 'OC', 'PA 1']
WHERE user_id IN (
  SELECT user_id 
  FROM user_hierarchy 
  WHERE UPPER(role) IN ('CEO', 'VP')
);
