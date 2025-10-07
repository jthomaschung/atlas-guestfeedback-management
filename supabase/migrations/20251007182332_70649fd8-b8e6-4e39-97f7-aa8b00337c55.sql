-- Add unique constraint to prevent duplicate acknowledgments
-- First, clean up duplicate records keeping only the oldest one for each user/feedback combination
DELETE FROM critical_feedback_approvals a
USING critical_feedback_approvals b
WHERE a.id > b.id
  AND a.feedback_id = b.feedback_id
  AND a.approver_user_id = b.approver_user_id;

-- Now add the unique constraint
ALTER TABLE critical_feedback_approvals
ADD CONSTRAINT unique_feedback_approver UNIQUE (feedback_id, approver_user_id);