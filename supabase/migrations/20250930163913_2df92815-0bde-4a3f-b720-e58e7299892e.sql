-- Update customer feedback records from deleted FL 3 market to new markets
-- Update stores 1127, 1441, 3613 from FL 3 to FL 1
UPDATE customer_feedback
SET market = 'FL 1', updated_at = now()
WHERE market = 'FL 3' 
AND store_number IN ('1127', '1441', '3613');

-- Update store 3030 from FL 3 to FL 2
UPDATE customer_feedback
SET market = 'FL 2', updated_at = now()
WHERE market = 'FL 3' 
AND store_number = '3030';