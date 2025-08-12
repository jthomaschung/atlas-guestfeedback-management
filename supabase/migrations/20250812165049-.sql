-- Update Austin Mackley's permissions to include AZ1 market access
UPDATE user_permissions 
SET markets = ARRAY['AZ1']
WHERE user_id = '9806d518-64e4-44a5-b9b7-acdbbee095ec';