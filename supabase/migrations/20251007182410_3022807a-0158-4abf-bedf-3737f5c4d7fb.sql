-- Clean up duplicate acknowledgment records, keeping only the oldest one
DELETE FROM critical_feedback_approvals a
USING critical_feedback_approvals b
WHERE a.id > b.id
  AND a.feedback_id = b.feedback_id
  AND a.approver_user_id = b.approver_user_id;