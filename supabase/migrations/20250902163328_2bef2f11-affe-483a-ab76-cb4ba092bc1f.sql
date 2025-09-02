-- Enable development user flag specifically for James Chung to see the Portal Access tab
UPDATE user_permissions 
SET is_development_user = true 
WHERE user_id = (
  SELECT user_id FROM profiles 
  WHERE email = 'james.chung@atlaswe.com'
);

-- If no permissions record exists for James Chung, create one
INSERT INTO user_permissions (user_id, is_development_user, can_access_facilities_dev)
SELECT 
  user_id, 
  true,
  true
FROM profiles 
WHERE email = 'james.chung@atlaswe.com'
AND user_id NOT IN (SELECT user_id FROM user_permissions);