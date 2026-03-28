
-- Normalize existing feedback categories to standard values
-- Fix case mismatches
UPDATE public.customer_feedback SET complaint_category = 'Sandwich Made Wrong' WHERE complaint_category = 'Sandwich Made wrong';
UPDATE public.customer_feedback SET complaint_category = 'Out of Product' WHERE complaint_category = 'Out Of Product';

-- Map known external categories to standard ones
UPDATE public.customer_feedback SET complaint_category = 'Sandwich Made Wrong' WHERE complaint_category = 'Order Accuracy';
UPDATE public.customer_feedback SET complaint_category = 'Slow Service' WHERE complaint_category = 'Delivery Timing';
UPDATE public.customer_feedback SET complaint_category = 'Closed Early' WHERE complaint_category = 'Hours';
UPDATE public.customer_feedback SET complaint_category = 'Product Issue' WHERE complaint_category = 'Product Quality';
UPDATE public.customer_feedback SET complaint_category = 'Out of Product' WHERE complaint_category = 'Out of Stock Item';
UPDATE public.customer_feedback SET complaint_category = 'Missing Item' WHERE complaint_category = 'Missing Items';
UPDATE public.customer_feedback SET complaint_category = 'Rude Service' WHERE complaint_category = 'Team Member Complaint';
UPDATE public.customer_feedback SET complaint_category = 'Possible Food Poisoning' WHERE complaint_category IN ('Health Safety', 'Illness', 'Allergic Reaction Guest');
UPDATE public.customer_feedback SET complaint_category = 'Credit Card Issue' WHERE complaint_category IN ('Gift Card Issue', 'Incorrect Change', 'Pricing Issue');
UPDATE public.customer_feedback SET complaint_category = 'Other' WHERE complaint_category IN ('Appearance', 'Area of Restaurant', 'Online Ordering', 'Online Ordering Issues', 'Duplicate Order', 'Employment and Hiring', 'Menu Question', 'No Feedback Provided', 'Not Honored', 'Order Not Received', 'Wrong Store', 'Gloves/Equipment');
