-- Update FL market assignments based on store consolidation

-- FL 1 stores: 1127, 1441, 3029, 3187, 3613, 4105
UPDATE customer_feedback 
SET market = 'FL 1', updated_at = now()
WHERE store_number IN ('1127', '1441', '3029', '3187', '3613', '4105')
  AND market != 'FL 1';

-- FL 2 stores: 1307, 1440, 1562, 1789, 3030, 3612
UPDATE customer_feedback 
SET market = 'FL 2', updated_at = now()
WHERE store_number IN ('1307', '1440', '1562', '1789', '3030', '3612')
  AND market != 'FL 2';