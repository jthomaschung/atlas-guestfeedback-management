-- Update the Admin role to lowercase 'admin' to match the is_admin function
UPDATE user_hierarchy 
SET role = 'admin' 
WHERE role = 'Admin';