-- Update existing feedback records with correct priorities
UPDATE customer_feedback 
SET priority = 'Medium'
WHERE complaint_category IN ('Slow Service', 'Bread Quality', 'Cleanliness');

-- Update Praise to High priority
UPDATE customer_feedback 
SET priority = 'High'
WHERE complaint_category = 'Praise';