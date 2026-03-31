-- 1. Fix CCC8553567: mark as FYI
UPDATE customer_feedback SET type_of_feedback = 'FYI' WHERE case_number = 'CCC8553567';

-- 2. Set ALL FYI records to acknowledged status
UPDATE customer_feedback SET resolution_status = 'acknowledged' WHERE type_of_feedback = 'FYI' AND resolution_status != 'acknowledged';

-- 3. Reassign FYI records with store-level categories to their stores
UPDATE customer_feedback 
SET assignee = 'store' || store_number || '@atlaswe.com'
WHERE type_of_feedback = 'FYI' 
AND complaint_category IN ('Sandwich Made Wrong', 'Missing Item', 'Order Accuracy', 'Cleanliness', 'Closed Early')
AND assignee = 'guestfeedback@atlaswe.com';