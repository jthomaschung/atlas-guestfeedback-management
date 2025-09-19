-- Update existing Out of Product feedback to Critical priority
UPDATE customer_feedback 
SET priority = 'Critical', 
    updated_at = now()
WHERE complaint_category ILIKE '%out of product%' 
   OR complaint_category ILIKE '%out-of-product%';