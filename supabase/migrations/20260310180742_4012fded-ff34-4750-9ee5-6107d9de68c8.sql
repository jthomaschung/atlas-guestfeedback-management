-- Normalize historical category names to standard values
UPDATE customer_feedback SET complaint_category = 'Sandwich Made Wrong' WHERE lower(complaint_category) = 'order accuracy';
UPDATE customer_feedback SET complaint_category = 'Closed Early' WHERE lower(complaint_category) = 'hours';
UPDATE customer_feedback SET complaint_category = 'Rude Service' WHERE lower(complaint_category) = 'team member friendliness';
UPDATE customer_feedback SET complaint_category = 'Slow Service' WHERE lower(complaint_category) = 'delivery timing';
UPDATE customer_feedback SET complaint_category = 'Missing Item' WHERE lower(complaint_category) = 'missing items';
UPDATE customer_feedback SET complaint_category = 'Sandwich Made Wrong' WHERE lower(complaint_category) IN ('sandwich issue', 'order issue');
UPDATE customer_feedback SET complaint_category = 'Out of Product' WHERE lower(complaint_category) = 'oop';