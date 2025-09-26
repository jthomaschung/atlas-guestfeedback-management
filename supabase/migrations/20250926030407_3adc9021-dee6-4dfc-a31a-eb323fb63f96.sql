-- Escalate existing critical feedback to populate executive oversight
UPDATE customer_feedback 
SET 
  resolution_status = 'escalated',
  escalated_at = now(),
  auto_escalated = true,
  sla_deadline = now() + INTERVAL '2 hours'
WHERE 
  (priority = 'Critical' OR complaint_category IN ('Out of Product', 'Rude Service'))
  AND resolution_status != 'escalated'
  AND created_at >= (now() - INTERVAL '7 days');

-- Insert escalation log entries for the escalated feedback (without escalated_by to avoid FK constraint)
INSERT INTO escalation_log (
  feedback_id,
  escalated_from,
  escalated_to,
  escalation_reason
)
SELECT 
  cf.id,
  'unopened',
  'escalated',
  'Auto-escalated: Critical issue detected - ' || cf.complaint_category
FROM customer_feedback cf
WHERE 
  cf.resolution_status = 'escalated'
  AND cf.auto_escalated = true
  AND cf.escalated_at >= (now() - INTERVAL '1 hour');