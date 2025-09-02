-- Enable development user flag for the current user to see the Portal Access tab
UPDATE user_permissions 
SET is_development_user = true 
WHERE user_id = (
  SELECT user_id FROM profiles 
  WHERE email = (SELECT get_current_user_email())
);

-- If no permissions record exists for the current user, create one
INSERT INTO user_permissions (user_id, is_development_user, can_access_facilities_dev)
SELECT 
  user_id, 
  true,
  true
FROM profiles 
WHERE email = (SELECT get_current_user_email())
AND user_id NOT IN (SELECT user_id FROM user_permissions);