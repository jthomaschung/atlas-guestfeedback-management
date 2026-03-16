-- Delete duplicate feedback entries for case CCC8493651
DELETE FROM customer_feedback 
WHERE case_number = 'CCC8493651';

-- Verify deletion
SELECT COUNT(*) as remaining_count FROM customer_feedback WHERE case_number = 'CCC8493651';