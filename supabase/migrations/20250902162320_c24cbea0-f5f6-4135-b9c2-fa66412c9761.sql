-- Add portal access columns to user_permissions table
ALTER TABLE user_permissions 
ADD COLUMN can_access_facilities_dev BOOLEAN DEFAULT true,
ADD COLUMN can_access_catering_dev BOOLEAN DEFAULT false,
ADD COLUMN can_access_hr_dev BOOLEAN DEFAULT false,
ADD COLUMN can_access_guest_feedback_dev BOOLEAN DEFAULT false;

-- Add development flag to identify dev users
ALTER TABLE user_permissions 
ADD COLUMN is_development_user BOOLEAN DEFAULT false;