UPDATE customer_feedback SET complaint_category = 'Slow Service' WHERE complaint_category IN ('Delivery Complaint', 'Delivery Timing');
UPDATE customer_feedback SET complaint_category = 'Closed Early' WHERE complaint_category = 'Hours';
UPDATE customer_feedback SET complaint_category = 'Other' WHERE complaint_category = 'Portion';
UPDATE customer_feedback SET complaint_category = 'Product Issue' WHERE complaint_category = 'Product Quality';
UPDATE customer_feedback SET complaint_category = 'Sandwich Made Wrong' WHERE complaint_category IN ('Sandwich Made wrong', 'Submitted Incorrect Order');