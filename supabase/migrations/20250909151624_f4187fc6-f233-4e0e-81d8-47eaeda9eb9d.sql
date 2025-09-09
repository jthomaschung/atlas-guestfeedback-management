-- Update the existing Sandwich Made wrong record to have correct priority and assignee
UPDATE customer_feedback 
SET 
  priority = 'High',
  assignee = 'store2884@atlawe.com'
WHERE 
  case_number = 'CF-1757430427535-T0TM' 
  AND complaint_category = 'Sandwich Made wrong'
  AND store_number = '2884';