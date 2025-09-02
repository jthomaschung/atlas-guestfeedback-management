-- Create user_permissions record for jchung@atlaswe.com and enable development flag
INSERT INTO user_permissions (user_id, is_development_user)
SELECT user_id, true
FROM profiles 
WHERE email = 'jchung@atlaswe.com'
ON CONFLICT (user_id) DO UPDATE SET 
  is_development_user = true,
  updated_at = now();