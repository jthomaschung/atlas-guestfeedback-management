-- Update any remaining Out Of Product feedback that's still miscategorized
-- Handle all variations including extra spaces
UPDATE customer_feedback
SET 
  priority = 'Critical',
  updated_at = now()
WHERE 
  LOWER(REGEXP_REPLACE(complaint_category, '\s+', ' ', 'g')) = 'out of product'
  AND priority != 'Critical';