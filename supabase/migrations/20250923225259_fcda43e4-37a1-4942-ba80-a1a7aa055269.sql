-- Standardize complaint categories to eliminate duplicates due to capitalization
UPDATE customer_feedback 
SET complaint_category = 'Missing Items'
WHERE complaint_category = 'Missing Item';

UPDATE customer_feedback 
SET complaint_category = 'Out of Product'
WHERE complaint_category = 'Out Of Product';

UPDATE customer_feedback 
SET complaint_category = 'Product Issue'
WHERE complaint_category = 'Product issue';

UPDATE customer_feedback 
SET complaint_category = 'Sandwich Made Wrong'
WHERE complaint_category = 'Sandwich Made wrong';