UPDATE customer_feedback
SET resolution_status = 'acknowledged'
WHERE LOWER(type_of_feedback) = 'fyi'
  AND resolution_status IN ('unopened', 'opened', 'processing');