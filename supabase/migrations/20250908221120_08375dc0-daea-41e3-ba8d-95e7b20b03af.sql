-- Add training portal access permission to user_permissions table
ALTER TABLE public.user_permissions 
ADD COLUMN can_access_training_dev boolean DEFAULT false;