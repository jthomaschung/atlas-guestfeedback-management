-- Update the default value for new users to have guest feedback access
ALTER TABLE public.user_permissions 
ALTER COLUMN can_access_guest_feedback_dev SET DEFAULT true;

-- Update all existing users to have guest feedback access
UPDATE public.user_permissions 
SET can_access_guest_feedback_dev = true 
WHERE can_access_guest_feedback_dev = false;