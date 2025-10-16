-- Add 'processing' as a valid resolution_status value
-- Note: We don't need to alter the column type since it's already text
-- This migration just documents that 'processing' is now a valid status value

-- Add a comment to document the valid values
COMMENT ON COLUMN public.customer_feedback.resolution_status IS 
'Valid values: unopened, opened, responded, resolved, escalated, processing';
