-- Update existing feedback records with correct assignments
UPDATE customer_feedback 
SET assignee = CASE 
  WHEN complaint_category IN ('Sandwich Made wrong', 'Closed Early', 'Praise', 'Missing Item', 'Cleanliness') 
    THEN 'store' || store_number || '@atlawe.com'
  WHEN complaint_category IN ('Slow Service', 'Product issue', 'Credit Card Issue', 'Bread Quality', 'Other', 'Loyalty Program Issues') 
    THEN 'guestfeedback@atlaswe.com'
  WHEN complaint_category IN ('Rude Service', 'Out of product', 'Possible Food Poisoning') 
    THEN 'Unassigned'
  ELSE 'guestfeedback@atlaswe.com'
END
WHERE assignee IS NULL OR assignee = 'Unassigned';