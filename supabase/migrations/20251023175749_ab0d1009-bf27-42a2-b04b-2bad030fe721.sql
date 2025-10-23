-- Add archived field to internal_feedback table
ALTER TABLE internal_feedback 
ADD COLUMN archived boolean NOT NULL DEFAULT false;

-- Add index for better query performance on archived items
CREATE INDEX idx_internal_feedback_archived ON internal_feedback(archived);

-- Add archived_at timestamp to track when items were archived
ALTER TABLE internal_feedback 
ADD COLUMN archived_at timestamp with time zone;