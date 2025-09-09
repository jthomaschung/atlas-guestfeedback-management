-- Update unassigned feedback records with correct assignees
UPDATE customer_feedback 
SET assignee = CASE
  WHEN store_number = '2876' AND complaint_category = 'Closed Early' THEN 'juan.jaime@atlaswe.com'
  WHEN store_number = '799' AND complaint_category = 'Praise' THEN 'store799@atlaswe.com'
  WHEN store_number = '2504' AND complaint_category = 'Sandwich Made wrong' THEN 'store2504@atlaswe.com'
  WHEN store_number = '1956' AND complaint_category = 'Sandwich Made wrong' THEN 'store1956@atlaswe.com' 
  WHEN store_number = '930' AND complaint_category = 'Praise' THEN 'store930@atlaswe.com'
  ELSE assignee
END
WHERE assignee = 'Unassigned' AND store_number IN ('2876', '799', '2504', '1956', '930');