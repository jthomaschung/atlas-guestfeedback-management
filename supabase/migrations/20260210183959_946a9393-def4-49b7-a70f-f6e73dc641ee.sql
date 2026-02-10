
-- Fix #REF! market values based on correct store-to-market mappings
-- Store 1554 belongs to AZ 3
UPDATE customer_feedback SET market = 'AZ 3' WHERE market = '#REF!' AND store_number = '1554';
-- Store 1957 belongs to AZ 3
UPDATE customer_feedback SET market = 'AZ 3' WHERE market = '#REF!' AND store_number = '1957';
-- Store 2178 belongs to AZ 3
UPDATE customer_feedback SET market = 'AZ 3' WHERE market = '#REF!' AND store_number = '2178';
