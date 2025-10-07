-- Fix market naming inconsistency: Update NE4 to NE 4
UPDATE customer_feedback 
SET market = 'NE 4' 
WHERE market = 'NE4';