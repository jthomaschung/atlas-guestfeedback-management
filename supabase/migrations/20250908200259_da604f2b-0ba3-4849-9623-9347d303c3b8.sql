-- Update existing feedback records to use correct priority mapping
UPDATE customer_feedback 
SET priority = CASE 
  WHEN complaint_category = 'Sandwich Made wrong' THEN 'High'
  WHEN complaint_category = 'Slow Service' THEN 'High'
  WHEN complaint_category = 'Rude Service' THEN 'Critical'
  WHEN complaint_category = 'Product issue' THEN 'Low'
  WHEN complaint_category = 'Closed Early' THEN 'High'
  WHEN complaint_category = 'Praise' THEN 'Praise'
  WHEN complaint_category = 'Missing Item' THEN 'High'
  WHEN complaint_category = 'Credit Card Issue' THEN 'Low'
  WHEN complaint_category = 'Bread Quality' THEN 'High'
  WHEN complaint_category = 'Out of product' THEN 'High'
  WHEN complaint_category = 'Other' THEN 'Low'
  WHEN complaint_category = 'Cleanliness' THEN 'High'
  WHEN complaint_category = 'Possible Food Poisoning' THEN 'Critical'
  WHEN complaint_category = 'Loyalty Program Issues' THEN 'Low'
  ELSE priority -- Keep existing priority if category doesn't match
END,
updated_at = now()
WHERE complaint_category IN (
  'Sandwich Made wrong', 'Slow Service', 'Rude Service', 'Product issue', 
  'Closed Early', 'Praise', 'Missing Item', 'Credit Card Issue', 
  'Bread Quality', 'Out of product', 'Other', 'Cleanliness', 
  'Possible Food Poisoning', 'Loyalty Program Issues'
);