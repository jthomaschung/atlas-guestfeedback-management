UPDATE customer_feedback
SET 
  priority = 'Critical',
  resolution_status = 'escalated',
  escalated_at = COALESCE(escalated_at, now()),
  auto_escalated = true,
  sla_deadline = COALESCE(sla_deadline, now() + interval '48 hours')
WHERE LOWER(complaint_category) IN ('rude service','out of product','possible food poisoning','rude','oop')
  AND priority IS DISTINCT FROM 'Critical'
  AND COALESCE(resolution_status, 'unopened') IN ('unopened','acknowledged','processing','opened');

-- Also fix rows already Critical but never escalated
UPDATE customer_feedback
SET 
  resolution_status = 'escalated',
  escalated_at = COALESCE(escalated_at, now()),
  auto_escalated = true,
  sla_deadline = COALESCE(sla_deadline, now() + interval '48 hours')
WHERE LOWER(complaint_category) IN ('rude service','out of product','possible food poisoning','rude','oop')
  AND priority = 'Critical'
  AND COALESCE(resolution_status, 'unopened') IN ('unopened','acknowledged','processing','opened');