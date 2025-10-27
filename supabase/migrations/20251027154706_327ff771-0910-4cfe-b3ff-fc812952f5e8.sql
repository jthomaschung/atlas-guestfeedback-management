-- Fix feedback items with non-critical categories but Critical priority
-- These should be resolved if all 4 executive approvals are complete

-- First, update priority for all feedback where category doesn't match priority
UPDATE customer_feedback
SET 
  priority = CASE 
    WHEN LOWER(complaint_category) IN ('rude service', 'out of product', 'possible food poisoning', 'food poisoning') THEN 'Critical'
    WHEN LOWER(complaint_category) IN ('sandwich made wrong', 'closed early', 'missing item', 'missing items', 'order accuracy', 'multiple issues') THEN 'High'
    WHEN LOWER(complaint_category) IN ('slow service', 'bread quality', 'cleanliness', 'food quality', 'staff service', 'store appearance', 'wait time', 'temperature', 'quantity', 'manager/supervisor contact request') THEN 'Medium'
    WHEN LOWER(complaint_category) IN ('praise', 'appreciation') THEN 'Praise'
    ELSE 'Low'
  END,
  updated_at = now()
WHERE priority != CASE 
    WHEN LOWER(complaint_category) IN ('rude service', 'out of product', 'possible food poisoning', 'food poisoning') THEN 'Critical'
    WHEN LOWER(complaint_category) IN ('sandwich made wrong', 'closed early', 'missing item', 'missing items', 'order accuracy', 'multiple issues') THEN 'High'
    WHEN LOWER(complaint_category) IN ('slow service', 'bread quality', 'cleanliness', 'food quality', 'staff service', 'store appearance', 'wait time', 'temperature', 'quantity', 'manager/supervisor contact request') THEN 'Medium'
    WHEN LOWER(complaint_category) IN ('praise', 'appreciation') THEN 'Praise'
    ELSE 'Low'
  END;

-- Now resolve feedback that has all 4 approvals but is no longer Critical priority
WITH feedback_with_all_approvals AS (
  SELECT 
    cf.id,
    cf.case_number,
    cf.priority,
    cf.resolution_status,
    cf.complaint_category,
    COUNT(DISTINCT cfa.approver_role) as approval_count,
    BOOL_AND(cfa.approver_role IN ('ceo', 'vp', 'director', 'dm')) as has_all_roles
  FROM customer_feedback cf
  LEFT JOIN critical_feedback_approvals cfa ON cf.id = cfa.feedback_id
  WHERE cf.resolution_status = 'escalated'
    AND cf.priority != 'Critical'
  GROUP BY cf.id, cf.case_number, cf.priority, cf.resolution_status, cf.complaint_category
  HAVING COUNT(DISTINCT cfa.approver_role) >= 4
)
UPDATE customer_feedback cf
SET 
  resolution_status = 'resolved',
  resolution_notes = COALESCE(cf.resolution_notes || E'\n\n', '') || 
    'Auto-resolved on ' || to_char(now(), 'YYYY-MM-DD HH24:MI') || 
    ': Category "' || cf.complaint_category || '" is non-critical (Priority: ' || cf.priority || '). ' ||
    'All executive approvals (CEO, VP, Director, DM) were completed before category change.',
  escalated_at = NULL,
  escalated_by = NULL,
  sla_deadline = NULL,
  auto_escalated = NULL,
  updated_at = now()
FROM feedback_with_all_approvals fwaa
WHERE cf.id = fwaa.id;