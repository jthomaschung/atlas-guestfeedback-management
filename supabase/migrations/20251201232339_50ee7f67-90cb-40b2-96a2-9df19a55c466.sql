-- First, remove the old constraint
ALTER TABLE critical_feedback_approvals
DROP CONSTRAINT IF EXISTS unique_feedback_approver;

-- Delete duplicate approvals, keeping only the earliest one for each (feedback_id, approver_role) pair
DELETE FROM critical_feedback_approvals a
USING critical_feedback_approvals b
WHERE a.id > b.id
  AND a.feedback_id = b.feedback_id
  AND a.approver_role = b.approver_role;

-- Now add the new unique constraint
ALTER TABLE critical_feedback_approvals
ADD CONSTRAINT unique_feedback_role
UNIQUE (feedback_id, approver_role);