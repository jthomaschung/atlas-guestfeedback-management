
-- Fix store 2180 incorrectly assigned to AZ 3 (should be AZ 4)
UPDATE customer_feedback SET market = 'AZ 4' WHERE market = 'AZ 3' AND store_number = '2180';

-- Fix store 2500 incorrectly assigned to AZ 3 (should be AZ 1)
UPDATE customer_feedback SET market = 'AZ 1' WHERE market = 'AZ 3' AND store_number = '2500';

-- Fix store 2502 incorrectly assigned to AZ 3 (should be AZ 1)
UPDATE customer_feedback SET market = 'AZ 1' WHERE market = 'AZ 3' AND store_number = '2502';
