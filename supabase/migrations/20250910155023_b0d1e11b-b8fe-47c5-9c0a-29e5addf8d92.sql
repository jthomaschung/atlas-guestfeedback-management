-- Fix existing unassigned feedback records from store 1337
-- Missing Item should go to store email
UPDATE customer_feedback 
SET assignee = 'store1337@atlaswe.com' 
WHERE assignee = 'Unassigned' 
  AND store_number = '1337' 
  AND complaint_category = 'Missing Item';

-- Rude Service should go to DM for MN1 market  
UPDATE customer_feedback 
SET assignee = 'eric.beckstrom@atlaswe.com' 
WHERE assignee = 'Unassigned' 
  AND store_number = '1337' 
  AND complaint_category = 'Rude Service' 
  AND market = 'MN 1';